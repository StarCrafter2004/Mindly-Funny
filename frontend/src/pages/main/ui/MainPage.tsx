import { TestCard } from "@/entities/testCard";

import { PremiumCard, PricingCard } from "@/widgets/pricingCard";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTests } from "../api";
import type { TestPreview } from "../model/types";
import { Link, useNavigate, useSearchParams } from "react-router";
import { OffersSlider } from "@/widgets/offersSlider";
import { useTranslation } from "react-i18next";
import { requestInvoice } from "@/features/payment";
import { FilterSlider } from "@/widgets/filterSlider";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import { useTonPay } from "@/features/payment/model/requestInvoice";
import { PrimaryButton } from "@/shared/components";

export const MainPage = () => {
  const isPremium = useProfileStore((store) => store.isPremium);

  const navigate = useNavigate(); // хук для навигации
  const { t } = useTranslation();
  const { pay } = useTonPay();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [tests, setTests] = useState<TestPreview[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestPreview | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false); // вот он
  const [error, setError] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter") || "all";
  const [filter, setFilter] = useState<string>(urlFilter);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await getTests(page, filter);

      setTests((prev) => [...prev, ...res.data]);
      setHasNext(res.pagination.hasNext);
    } catch (e) {
      setError(true);

      console.error("Failed to fetch tests", e);
    } finally {
      setLoading(false); // выключаем загрузку
    }
  };

  useEffect(() => {
    if (isPremiumModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isPremiumModalOpen]);

  useEffect(() => {
    if (page === -1) {
      setPage(1);
    } else {
      if (!loading && !error && hasNext) {
        fetchTests();
      }
    }
  }, [page]);

  useEffect(() => {
    setTests([]);
    setError(false);
    setPage(-1);
    setHasNext(true);
  }, [filter]);

  useEffect(() => {
    const onScroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight;
      const threshold = document.body.scrollHeight;

      if (scrolledTo >= threshold && hasNext && !loading) {
        setPage((prev) => prev + 1); // подгружаем следующую
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNext, loading]);

  const handleTestClick = (test: TestPreview) => {
    if (!test.isPurchased) {
      setSelectedTest(test);
      setIsTestModalOpen(true);
    } else {
      navigate(`/test/${test.documentId}`);
    }
  };

  return (
    <div className="bg-surface-primary min-h-screen w-full overflow-y-auto pb-[96px]">
      <div className="w-full py-[16px]">
        {!isPremium && (
          <OffersSlider
            className="mb-[24px]"
            showPremium={true}
            onBuyPremium={() => {
              setIsPremiumModalOpen(true);
            }}
          />
        )}
        <div className="text-text-primary mb-[12px] px-[16px] text-[24px] font-semibold">
          {t("main.title")}
        </div>
        <FilterSlider
          filter={filter}
          onFilterChange={(newFilter) => {
            setFilter(newFilter);
            setSearchParams((prev) => {
              const newParams = new URLSearchParams(prev);
              newParams.set("filter", newFilter);
              return newParams;
            });
          }}
          options={[
            { id: "all", label: t("main.all") },
            { id: "free", label: t("main.free") },
            { id: "paid", label: t("main.paid") },
            isPremium ? null : { id: "purchased", label: t("main.purchased") },
            { id: "gift", label: t("main.gift") },
          ]}
        />
        <div className="px-[16px]">
          <div className="flex flex-col gap-[4px]">
            {tests &&
              (tests.length > 0 ? (
                tests.map((test) => (
                  <TestCard
                    className="hover:bg-surface-secondary cursor-pointer"
                    key={test.id}
                    name={test.name}
                    description={test.description}
                    stars={test.isPurchased ? null : test.stars}
                    ton={test.isPurchased ? null : test.ton}
                    time={test.timeLimit}
                    onClick={() => handleTestClick(test)}
                  />
                ))
              ) : filter === "purchased" && !loading ? (
                <div className="text-text-secondary text-[16px] font-normal">
                  {t("main.NullPurchased")}
                </div>
              ) : filter === "gift" && !loading ? (
                <div className="flex flex-col gap-[12px]">
                  <div className="text-text-secondary text-[16px] font-normal">
                    {t("main.NullGift")}
                  </div>
                  <Link to={"/profile/invitations"}>
                    <PrimaryButton className="text-text-inversed rounded-[16px] px-[16px] py-[12px] text-[16px] font-medium">
                      {" "}
                      {t("main.Invite")}{" "}
                    </PrimaryButton>
                  </Link>
                </div>
              ) : null)}
            {loading && (
              <>
                <div className="bg-outline-secondary h-[160px] w-full animate-pulse rounded-[16px]"></div>
                <div className="bg-outline-secondary h-[160px] w-full animate-pulse rounded-[16px]"></div>
                <div className="bg-outline-secondary h-[160px] w-full animate-pulse rounded-[16px]"></div>
              </>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isPremiumModalOpen && (
          <>
            {/* Полупрозрачный фон */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPremiumModalOpen(false)}
            />

            {/* Модалка снизу */}
            <motion.div
              className="fixed right-0 bottom-0 left-0 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <PremiumCard
                onClose={() => {
                  setIsPremiumModalOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
        {isTestModalOpen && (
          <>
            {/* Полупрозрачный фон */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTestModalOpen(false)}
            />

            {/* Модалка снизу */}
            <motion.div
              className="fixed right-0 bottom-0 left-0 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <PricingCard
                stars={selectedTest?.stars}
                ton={selectedTest?.ton}
                onClose={() => {
                  setIsTestModalOpen(false);
                }}
                onStars={async () => {
                  if (selectedTest?.stars && selectedTest?.stars > 0) {
                    const status = await requestInvoice({
                      title: "Test",
                      description: "Buy Test",
                      amount: selectedTest?.stars,
                      type: "test",
                      testId: selectedTest?.documentId,
                    });
                    if (status === "paid") {
                      navigate(`/test/${selectedTest?.documentId}`);
                    }
                  }
                }}
                onTon={async () => {
                  if (selectedTest?.ton && selectedTest?.ton > 0) {
                    const res = await pay({
                      amount: selectedTest?.ton,
                      type: "test",
                      testId: selectedTest?.documentId,
                    });
                    console.log("tonStatus", res);
                    if (res.status === "paid") {
                      navigate(`/test/${selectedTest?.documentId}`);
                    }
                  }
                }}
              >
                {" "}
                <TestCard
                  key={selectedTest?.id}
                  name={selectedTest?.name}
                  description={selectedTest?.description}
                  time={selectedTest?.timeLimit}
                />
              </PricingCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
