import { useEffect, type FC } from "react";

interface ToastMessageProps {
  message: string;
  isFailed?: boolean;
  isVisible: boolean;
  onClose: () => void;
}
const ToastMessage: FC<ToastMessageProps> = ({
  message,
  isFailed,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <>
      <div
        className={`fixed top-4 right-4 z-999999 flex items-center w-full max-w-md p-4 mb-4 text-black ${isFailed ? "bg-red-100" : "bg-green-100"} rounded-lg shadow-lg transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
        role="alert"
      >
        <div
          className={`inline-flex items-center justify-center shrink-0 w-8 h-8 ${isFailed ? "text-red-500 bg-red-200" : "text-green-500 bg-green-200"}
           rounded-lg transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-10"}`}
        >
          {isFailed ? (
    <>
        <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
        >
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18 17.94 6M18 18 6.06 6"
            />
        </svg>
        <span className="sr-only">Error icon</span>
    </>
) : (
    <>
        <svg
            className={`w-5 h-5 ${isFailed ? "text-red-600" : "text-green-600"}`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
        >
            <path
                d="M5 10.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <span className="sr-only">Check icon</span>
    </>
)}
          
        </div>
        <div className="ms-3 text-sm font-normal">{message}</div>
      </div>
    </>
  );
};

export default ToastMessage;
