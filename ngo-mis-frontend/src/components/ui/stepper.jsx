// src/components/ui/stepper.jsx
import { cn } from "../../lib/utils";

export const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      <ol className="flex items-center w-full max-w-2xl">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={step}
              className={cn(
                "flex w-full items-center",
                stepNumber < steps.length ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:inline-block dark:after:border-gray-700" : ""
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                {isCompleted ? (
                  <svg className="w-4 h-4 text-primary lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                  </svg>
                ) : (
                  <span className={cn("font-semibold text-gray-500", isCurrent && "text-primary")}>
                    {stepNumber}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
