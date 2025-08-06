import { useNavigate } from "react-router";

type ExitTestModalProps = {
  onClose: () => void;
  onExit?: () => void;
};

export const ExitTestModal = ({ onClose, onExit }: ExitTestModalProps) => {
  const navigate = useNavigate();

  const handleExit = () => {
    onExit?.(); // вызывается, если передан
    navigate("/main");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface-secondary max-w-sm overflow-hidden rounded-[14px] shadow-lg">
        <div className="px-[57px] py-[16px]">
          <h2 className="mt-[2px] text-center text-lg font-semibold">
            Exit test?
          </h2>
          <p className="mt-[2px] text-center text-sm text-gray-600">
            Your progress will be lost.
          </p>
        </div>
        <div className="mt-4 flex">
          <button
            onClick={onClose}
            className="flex-1 p-[12px] text-sm text-gray-800 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleExit}
            className="flex-1 bg-red-500 p-[12px] text-sm text-white hover:bg-red-600"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};
