import { Show, SimpleShowLayout, TextField } from "react-admin";

export const WageShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="amount" />
      </SimpleShowLayout>
    </Show>
  );
};
