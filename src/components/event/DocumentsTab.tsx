import { Heading } from "../Layout/Heading";
import type { Prisma } from "@prisma/client";
import { api } from "~/utils/api";
import { useRef, useState, type LegacyRef } from "react";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";
import type ReactSignatureCanvas from "react-signature-canvas";

export const DocumentsTab = ({
  event,
}: {
  event: Prisma.EventGetPayload<{ include: { contract: true } }>;
}) => {
  const { data: contract, isLoading: isContractLoading } =
    api.contracts.getContract.useQuery({
      id: event?.contract?.id ?? "",
    });
  const sigCanvas = useRef<ReactSignatureCanvas>();
  const formatIntoPng = () => {
    if (sigCanvas?.current) {
      const dataURL = sigCanvas?.current.toDataURL();
      return dataURL;
    }
  };
  const [open, setOpen] = useState(true);
  const [viewed, setViewed] = useState(false);
  return (
    <>
      <Heading>
        <h2>Documents</h2>
      </Heading>

      <span>
        Here you can view, download and sign important documents that you may
        need.
      </span>

      <div className="flex h-full flex-col">
        <span>Your contract</span>
        <a href={contract?.url} target="_blank" onClick={() => setViewed(true)}>
          <button>View</button>
        </a>
      </div>
      <div className="flex h-1/2 w-full justify-center">
        <SignatureCanvas
          ref={sigCanvas as LegacyRef<ReactSignatureCanvas> | undefined}
          canvasProps={
            {
              className: "sigCanvas",
              style: {
                backgroundColor: "#fff",
              },
              height: "full",
              width: "full",
            } as React.CanvasHTMLAttributes<HTMLCanvasElement>
          }
        />
      </div>
      <button
        onClick={() => {
          if (!viewed) {
            toast.error("You must read the contract first.", {
              duration: 5000,
            });
            return;
          }
          const dataURL = formatIntoPng();
          console.log("dataURL: ", dataURL);
        }}
      >
        Save
      </button>
      <button
        onClick={() => {
          if (sigCanvas.current) {
            sigCanvas.current.clear();
          }
        }}
      >
        Clear
      </button>
    </>
  );
};
