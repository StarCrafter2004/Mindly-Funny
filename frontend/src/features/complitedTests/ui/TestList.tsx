import { TestCard } from "@/entities/testCard";
import { useTranslation } from "react-i18next";
import { useCompletedTestsStore } from "../model/complitedTestStore";
import { useEffect } from "react";
import { Link } from "react-router";
import { SecondaryButton } from "@/shared/components";

export const TestList = () => {
  const tests = useCompletedTestsStore((store) => store.tests);
  const loadLastCompletedTests = useCompletedTestsStore(
    (store) => store.loadLastCompletedTests,
  );
  const total = useCompletedTestsStore((store) => store.total);
  const loading = useCompletedTestsStore((store) => store.loading);
  const { t } = useTranslation();
  console.log("tests", tests);

  useEffect(() => {
    loadLastCompletedTests();
  }, []);

  return (
    <div>
      <div className="text-text-primary mb-[12px] text-[24px] font-semibold">
        {t("profile.completedTests")}
      </div>
      <div className="mb-[12px] flex flex-col gap-[4px]">
        {loading ? (
          <>
            <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
            <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
            <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
          </>
        ) : (
          tests.map((test) => (
            <Link to={`/profile/result/${test.testId}`}>
              <TestCard
                key={test.testId}
                name={test.test.name}
                completeDate={test.createdAt}
                iq={test.iq}
              />
            </Link>
          ))
        )}
      </div>

      {total != null && total > 3 ? (
        <Link to="completed-tests">
          <SecondaryButton className="h-[64px] w-full rounded-[16px]">
            {t("profile.viewAll")}
          </SecondaryButton>
        </Link>
      ) : total === 0 ? (
        <div>
          {" "}
          <div className="text-text-secondary test-[16px] mb-[12px] font-normal">
            {t("completedTests.NoTests")}
          </div>
          <Link to="/main">
            <SecondaryButton className="h-[64px] w-full rounded-[16px]">
              {t("profile.goToTests")}
            </SecondaryButton>
          </Link>
        </div>
      ) : null}
    </div>
  );
};
