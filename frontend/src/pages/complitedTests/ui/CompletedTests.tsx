import { TestCard } from "@/entities/testCard";
import { useCompletedTestsStore } from "@/features/complitedTests/model/complitedTestStore";
import { useEffect } from "react";
import { Link } from "react-router";

export const CompletedTests = () => {
  const tests = useCompletedTestsStore((store) => store.tests);
  const loadCompletedTests = useCompletedTestsStore(
    (store) => store.loadCompletedTests,
  );
  const loading = useCompletedTestsStore((store) => store.loading);

  useEffect(() => {
    loadCompletedTests();
  }, []);

  return (
    <div className="bg-surface-primary min-h-screen w-full overflow-y-auto">
      <div className="p-[16px]">
        <div className="flex flex-col gap-[4px]">
          {tests.map((test) => (
            <Link to={`/result/${test.testId}`}>
              {" "}
              <TestCard
                name={test.test.name}
                completeDate={test.createdAt}
                iq={test.iq}
              />
            </Link>
          ))}
          {loading && (
            <>
              <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
              <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
