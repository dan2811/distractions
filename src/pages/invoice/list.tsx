import type { Prisma } from "@prisma/client";
import React, { useEffect, useRef } from "react";
import { Heading } from "~/components/Layout/Heading";
import Layout from "~/components/Layout/Layout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";
import { differenceInDays } from "~/utils/date";

const InvoiceList = () => {
  const { data, isInitialLoading, fetchNextPage, hasNextPage } =
    api.jobs.listInvoicesInfinite.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastInvoiceElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isInitialLoading) return;

    const lastInvoiceElement = lastInvoiceElementRef.current;
    if (lastInvoiceElement && hasNextPage) {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            void fetchNextPage();
          }
        },
        { rootMargin: "0px", threshold: 0.1 },
      );
      observer.current.observe(lastInvoiceElement);
    }
  }, [isInitialLoading, fetchNextPage, hasNextPage]);

  if (isInitialLoading) return <LoadingSpinner />;

  return (
    <Layout pageName="Invoice List" pageDescription="List of invoices">
      <Heading>
        <h2 className="themed-h2">Invoices</h2>
      </Heading>
      <div className="flex flex-col gap-4 p-4 font-body">
        {data?.pages.map((page) => (
          <>
            {page.items.map((invoice, j) => (
              <div
                key={invoice.id}
                ref={j === page.items.length - 1 ? lastInvoiceElementRef : null}
              >
                <InvoiceListItem
                  invoice={
                    invoice as unknown as Prisma.InvoiceGetPayload<{
                      include: {
                        Job: true;
                      };
                    }>
                  }
                />
              </div>
            ))}
          </>
        ))}
      </div>
    </Layout>
  );
};

const InvoiceListItem = ({
  invoice,
}: {
  invoice: Prisma.InvoiceGetPayload<{
    include: {
      Job: true;
    };
  }>;
}) => {
  return (
    <a
      href={invoice.url}
      target="_blank"
      className="flex h-1/2 w-full items-center justify-between gap-2 rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center font-light bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md md:max-w-md"
    >
      <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
      <p>£{invoice.Job.pay}</p>
      <InvoiceStatus invoice={invoice} />
    </a>
  );
};

const InvoiceStatus = ({
  invoice,
}: {
  invoice: Prisma.InvoiceGetPayload<{
    include: {
      Job: true;
    };
  }>;
}) => {
  const commonClasses =
    "rounded-full border-2 border-main-accent p-2 text-gray-300 w-1/4 h-1/8 flex items-center justify-center";

  if (invoice.status === "paid") {
    return <p className={commonClasses}>PAID</p>;
  }

  if (invoice.status === "overdue") {
    return <p className={commonClasses}>DUE</p>;
  }

  const daysTillDue = differenceInDays(
    new Date(),
    new Date(new Date(invoice.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
  );
  return (
    <div className={commonClasses}>
      {daysTillDue > 0 ? `${daysTillDue} day(s)` : "DUE"}
    </div>
  );
};

export default InvoiceList;
