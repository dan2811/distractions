import { Typography } from "@mui/material";
import type { GeneralDocument } from "@prisma/client";
import { type Dispatch, type SetStateAction, useState } from "react";
import {
  Button,
  Create,
  DatagridConfigurable,
  DateField,
  List,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  required,
  useNotify,
  useRecordContext,
} from "react-admin";
import { UploadDropzone } from "~/utils/uploadthing";

export const GeneralDocumentList = () => {
  return (
    <List>
      <DocumentUploadWarning />
      <DatagridConfigurable rowClick="show" omit={["id"]}>
        <TextField source="id" />
        <TextField source="name" />
      </DatagridConfigurable>
    </List>
  );
};

export const GeneralDocumentShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <DocumentLink />
        <TextField source="description" />
        <DateField source="updatedAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
};

const DocumentLink = () => {
  const record = useRecordContext<GeneralDocument>();
  return (
    <a href={record?.url} target="_blank" rel="noopener noreferrer">
      <Button label={record.name} />
    </a>
  );
};

export const GeneralDocumentCreate = () => {
  const [url, setUrl] = useState("");
  const [fileId, setFileId] = useState("");
  return (
    <Create
      redirect="show"
      transform={(data: Record<string, unknown>) => ({
        ...data,
        url: url,
        id: fileId,
      })}
    >
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput source="description" validate={required()} multiline />
        <DocumentUpload setUrl={setUrl} setFileId={setFileId} />
      </SimpleForm>
    </Create>
  );
};

interface DocumentUploadProps {
  setUrl: Dispatch<SetStateAction<string>>;
  setFileId: Dispatch<SetStateAction<string>>;
}

const DocumentUpload = ({ setUrl, setFileId }: DocumentUploadProps) => {
  const notify = useNotify();
  return (
    <div>
      <DocumentUploadWarning />
      <UploadDropzone
        endpoint="generalDocumentUploader"
        onClientUploadComplete={(results) => {
          if (!results || results.length === 0) {
            notify("Upload failed", { type: "error" });
            return;
          }
          const result = results[0]!;
          setUrl(result.url);
          setFileId(result.key);
          notify("Upload Completed, don't forget to hit save!", {
            type: "info",
          });
        }}
        onUploadError={(error: Error) =>
          notify(`ERROR! ${error.message}`, { type: "error" })
        }
        content={{
          label: "Upload document",
        }}
      />
    </div>
  );
};

const DocumentUploadWarning = () => {
  return (
    <Typography variant="subtitle1" className="w-full p-4 text-red-700">
      <strong>These documents are visible to all clients.</strong> <br /> This
      is where you should upload commonly requested documents, like PLI
      certificates etc.
    </Typography>
  );
};
