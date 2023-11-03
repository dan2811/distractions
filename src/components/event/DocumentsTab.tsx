import { Heading } from "../Layout/Heading";
import type { Prisma } from "@prisma/client";
import { api } from "~/utils/api";
import { useRef, useState, type LegacyRef } from "react";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";
import type ReactSignatureCanvas from "react-signature-canvas";
import { LoadingSpinner } from "../LoadingSpinner";
import Image from "next/image";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

export const DocumentsTab = ({
  event,
}: {
  event: Prisma.EventGetPayload<{ include: { contract: true } }>;
}) => {
  const {
    data: contract,
    isLoading: isContractLoading,
    refetch: refetchContract,
  } = api.contracts.getContract.useQuery({
    id: event?.contract?.id ?? "",
  });
  const { mutateAsync: signContract, isLoading: signingContract } =
    api.contracts.signContract.useMutation();
  const sigCanvas = useRef<ReactSignatureCanvas>();
  const formatIntoPng = () => {
    if (sigCanvas?.current) {
      const dataURL = sigCanvas?.current.toDataURL();
      return dataURL;
    }
    throw new Error("No signature canvas");
  };
  const [viewed, setViewed] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const handleSignContract = async () => {
    if (!viewed) {
      toast.error("You must read the contract first.", {
        duration: 4000,
      });
      return;
    }
    if (!hasSigned) {
      toast.error("You must sign the contract first.", {
        duration: 4000,
      });
      return;
    }
    setSavingSignature(true);
    try {
      const signatureUrl = formatIntoPng();
      if (!contract?.id) {
        toast.error(
          "Something went wrong, please reload the page and try again",
          {
            duration: 4000,
          },
        );
        return;
      }
      await signContract({ signatureUrl, id: contract.id });
      toast.success("Contract signed", {
        duration: 4000,
      });
      await refetchContract();
      setSavingSignature(false);
    } catch (e) {
      toast.error("Something went wrong, please try again later", {
        duration: 4000,
      });
    }
  };
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
        <h3>Your event contract</h3>
        {isContractLoading ? (
          <LoadingSpinner />
        ) : (
          <a
            href={contract?.url}
            target="_blank"
            onClick={() => setViewed(true)}
          >
            <AssignmentIcon />
            {contract?.name}
          </a>
        )}
      </div>
      {savingSignature ? (
        <LoadingSpinner />
      ) : contract?.signatureUrl ? (
        <div className="align w-fit self-center bg-white">
          <Image
            src={contract.signatureUrl}
            alt="Your signature"
            width={100}
            height={100}
          />
        </div>
      ) : (
        <>
          <span>
            After you have read your contract, sign in the white box below and
            click save.
          </span>
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
              onBegin={() => setHasSigned(true)}
            />
          </div>
        </>
      )}
      {contract?.signatureUrl ? (
        <span>Contract signed</span>
      ) : (
        <>
          <button
            onClick={() => void handleSignContract()}
            disabled={signingContract}
            className="grid grid-cols-2 gap-2"
          >
            <SaveIcon className="place-self-end self-center" />
            <span className="place-self-start self-center">Save</span>
          </button>
          <button
            onClick={() => {
              if (sigCanvas.current) {
                sigCanvas.current.clear();
              }
            }}
            className="grid grid-cols-2 gap-2"
          >
            <DeleteIcon className="place-self-end self-center" />
            <span className="place-self-start self-center">Reset</span>
          </button>
        </>
      )}
    </>
  );
};
