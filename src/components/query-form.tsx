import React, { useEffect } from "react";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";
import { buttonVariants } from "@/components/ui/button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"


interface QueryResult {
  message: string;
  result: {
    name: string;
    birthday: string;
    usin: string;
  }[];
}
const QueryForm = () => {
  const [name, setName] = React.useState("");
  const [birthday, setBirthday] = React.useState("");
  const [result, setResult] = React.useState<QueryResult>();

  /**
   * 限制生日输入框只能输入数字和
   * 自动添加 `-` 符号
   * 如果是删除操作，忽略逻辑
   * @param e
   */
  const onBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    //@ts-expect-error
    const isDeletion = e.nativeEvent.inputType === 'deleteContentBackward' || e.nativeEvent.inputType === 'deleteContentForward';

    if (!isDeletion) {
      const lastChar = inputVal.charAt(inputVal.length - 1);
      if (isNaN(Number(lastChar))) {
        return;
      }
    }

    if (!isDeletion && (inputVal.length === 4 || inputVal.length === 7)) {
      setBirthday(inputVal + "-");
    } else {
      setBirthday(inputVal);
    }
  };


  const { toast } = useToast()

  const fetchData = async () => {
    const response = await fetch("/api/query.json", {
      method: "POST",
      body: JSON.stringify({
        name,
        birthday,
      }),
    }).then((res) => res.json());
    if (response.message !== "ok") {
      console.error(response.message);
      toast({variant: "destructive", title: "发生了错误...", description: response.message})
      return
    }
    setResult(response);
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col mb-12">
        <div className='flex flex-col items-center gap-5 text-center mb-8'>
          <span className="px-8 md:px-0 w-full md:w-64 flex flex-col gap-2 justify-start">
            <Input
              placeholder="姓名"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  fetchData();
                }
              }}
            />
            <Input
              placeholder="生日 (yyyy-mm-dd)"
              value={birthday}
              onChange={onBirthdayChange}
              maxLength={10}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  fetchData();
                }
              }}
            />
          </span>
        </div>

        <div className="flex justify-center space-x-2 md:space-x-4">
          <button
            onClick={fetchData}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Check
          </button>
        </div>
      </div>

      {result && (
        <section
          id="features"
          className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              在北大附中，有{result?.result.length}个人和你同生日
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 balance-text">
              著名的「生日问题」是问最少需要多少人，当中两人同一天生日的概率才会过半。答案是23人，所以在30人的小学班级中两人同生日的概率更高。对于60人或更多人，概率大于99%。
            </p>
          </div>
          <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-2 sm:grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">

            {result.result.map((person) => (
              <div key={person.name} className="relative overflow-hidden w-full rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-5">
                  <h1 className='text-4xl font-extrabold'>{`20${person.usin}届`}</h1>

                  <div className="space-y-2">
                    <h3 className="font-bold">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {person.birthday}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          </div>
          <div className="mx-auto text-center md:max-w-[58rem]">
            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7 balance-text">
              结果仅供娱乐，请勿用于非法用途
            </p>
          </div>
        </section>
      )}

    </>
  );
};

export default QueryForm;
