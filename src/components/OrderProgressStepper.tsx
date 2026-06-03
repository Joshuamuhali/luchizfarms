import { Check } from "lucide-react";
import {
  CUSTOMER_JOURNEY_STEPS,
  getJourneyStepIndex,
  type OrderStatus,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";

interface OrderProgressStepperProps {
  status: string;
  paymentStatus?: string;
  className?: string;
}

export default function OrderProgressStepper({
  status,
  paymentStatus = "pending",
  className,
}: OrderProgressStepperProps) {
  if (status === "cancelled") {
    return (
      <p className={cn("text-sm text-red-600 font-medium text-center py-2", className)}>
        This order was cancelled.
      </p>
    );
  }

  const activeIndex = getJourneyStepIndex(
    status === "ready_for_payment" && paymentStatus === "paid" ? "paid" : status
  );

  return (
    <ol className={cn("space-y-0", className)}>
      {CUSTOMER_JOURNEY_STEPS.map((step, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;
        const upcoming = index > activeIndex;

        return (
          <li key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0",
                  done && "bg-farm-leaf border-farm-leaf text-white",
                  current && "bg-farm-sunshine border-farm-sunshine text-white",
                  upcoming && "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                {done ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < CUSTOMER_JOURNEY_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[2rem] my-1",
                    done ? "bg-farm-leaf" : "bg-gray-200"
                  )}
                />
              )}
            </div>
            <div className={cn("pb-8", index === CUSTOMER_JOURNEY_STEPS.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "font-semibold",
                  current && "text-farm-leaf",
                  done && "text-foreground",
                  upcoming && "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {current && (
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-farm-leaf/10 text-farm-leaf">
                  You are here
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderProgressBar({ status }: { status: OrderStatus | string }) {
  const activeIndex = Math.max(0, getJourneyStepIndex(status));
  const percent = ((activeIndex + 1) / CUSTOMER_JOURNEY_STEPS.length) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-farm-leaf transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
