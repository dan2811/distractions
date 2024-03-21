import type { Prisma } from "@prisma/client";
import { api } from "~/utils/api";
import { useRef, useState, type LegacyRef, type MutableRefObject } from "react";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";
import type ReactSignatureCanvas from "react-signature-canvas";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingSpinner } from "../LoadingSpinner";
import type { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";

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

  const { data: generalDocuments, isLoading: isGeneralDocumentsLoading } =
    api.generalDocuments.getGeneralDocuments.useQuery();

  return (
    <div className="w-full md:max-w-lg md:place-self-center">
      {isContractLoading ? (
        <LoadingSpinner />
      ) : contract?.url ? (
        <DocumentCard
          id={contract.id}
          description="This is the contract for your event, please read it carefully. Click the sign button and provide your signature to confirm your agreement."
          name="Your Contract"
          url={contract.url}
          signable={true}
          // TODO: Nasty typing!! Please fix me!!
          refetch={refetchContract as RefetchType}
          signatureUrl={contract.signatureUrl}
        />
      ) : (
        <p className="px-4 py-6 text-center">
          Your event contract will {!generalDocuments?.length ? "" : "also"}{" "}
          appear here as soon as it is ready.
        </p>
      )}
      {!generalDocuments?.length ? null : (
        <h2 className="text-center text-xl font-light">Useful Documents</h2>
      )}
      {isGeneralDocumentsLoading && <LoadingSpinner />}
      {generalDocuments?.map((document) => (
        <DocumentCard
          key={document.id}
          id={document.id}
          name={document.name}
          description={document.description}
          url={document.url}
        />
      ))}
    </div>
  );
};

type RefetchType = UseQueryResult<"contracts">["refetch"];

interface DocumentCardProps {
  id: string;
  name: string;
  description: string;
  url?: string;
  signable?: boolean;
  refetch?: RefetchType;
  signatureUrl?: string | null;
}

const DocumentCard = ({
  id,
  name,
  description,
  url,
  signable = false,
  refetch,
  signatureUrl,
}: DocumentCardProps) => {
  const [hasSigned, setHasSigned] = useState(false);
  const [viewed, setViewed] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);

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
      if (!id) {
        toast.error(
          "Something went wrong, please reload the page and try again",
          {
            duration: 4000,
          },
        );
        setSavingSignature(false);
        return;
      }
      await signContract(
        { signatureUrl, id },
        {
          onSuccess: () => {
            toast.success("Contract signed", {
              duration: 4000,
            });
            setSignaturePadOpen(false);
          },
        },
      );
      if (!refetch) {
        toast.error("Something has gone wrong, please contact support");
        setSavingSignature(false);
        return;
      }
      await refetch();

      setSavingSignature(false);
    } catch (e) {
      toast.error("Something went wrong, please try again later", {
        duration: 4000,
      });
      setSavingSignature(false);
    }
  };
  if (!url) return null;
  if (savingSignature) return <LoadingSpinner />;
  return (
    <div className="gap-6 p-4 md:max-w-lg">
      <span className="grid w-full grid-cols-2 items-center justify-between gap-2 place-self-center rounded-lg bg-gradient-to-tl from-gray-900/40 to-gray-300/50 p-4 text-center bg-blend-darken shadow-inner shadow-gray-500 backdrop-blur-md">
        <h2 className="col-span-2">{name ?? "Your Document"}</h2>
        <p className="col-span-2 overflow-auto">{description}</p>
        <a
          href={url}
          target="_blank"
          className={`${
            signable ? (!signatureUrl ? "col-span-1" : "col-span-2") : "col-span-2"
          } min-w-full`}
          onClick={() => setViewed(true)}
        >
          <button className="w-full">VIEW</button>
        </a>
        {signatureUrl && (
          <div className="col-span-2 flex justify-center rounded-md p-2">
            <Image
              className="bg-white"
              src={signatureUrl}
              alt="Your signature"
              width={200}
              height={20}
            />
          </div>
        )}
        {signable && !signatureUrl && (
          <button
            className="col-span-1"
            onClick={() => setSignaturePadOpen(!signaturePadOpen)}
          >
            {signaturePadOpen ? "CANCEL" : "SIGN"}
          </button>
        )}
        {signaturePadOpen && (
          <SignaturePad
            setHasSigned={setHasSigned}
            handleSignContract={handleSignContract}
            isSigningContract={signingContract}
            sigCanvas={sigCanvas}
          />
        )}
      </span>
    </div>
  );
};

interface SignaturePadProps {
  setHasSigned: (input: boolean) => void;
  handleSignContract: () => Promise<void>;
  isSigningContract: boolean;
  sigCanvas: MutableRefObject<SignatureCanvas | undefined>;
}

const SignaturePad = ({
  setHasSigned,
  handleSignContract,
  isSigningContract,
  sigCanvas,
}: SignaturePadProps) => {
  return (
    <>
      <button
        onClick={() => {
          if (sigCanvas.current) {
            sigCanvas.current.clear();
          }
        }}
        className="flex justify-center gap-2"
      >
        <DeleteIcon />
        <span>RESET</span>
      </button>
      <button
        onClick={() => void handleSignContract()}
        disabled={isSigningContract}
        className="flex justify-center gap-2"
      >
        <SaveIcon />
        <span>SAVE</span>
      </button>

      <span className="col-span-2 h-52 w-full">
        {/* @ts-expect-error unknown */}
        <SignatureCanvas
          ref={sigCanvas as LegacyRef<ReactSignatureCanvas> | undefined}
          canvasProps={{
            className: "sigCanvas",
            style: {
              backgroundColor: "#fff",
              height: "100%",
              width: "100%",
            },
          }}
          onBegin={() => setHasSigned(true)}
        />
      </span>
    </>
  );
};
