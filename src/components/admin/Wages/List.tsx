import { DatagridConfigurable, List, TextField } from "react-admin";

export const WageList = () => {
  return (
    <List>
      <DatagridConfigurable
        rowClick="show"
        omit={["id"]}
        bulkActionButtons={false}
      >
        <TextField source="name" />
      </DatagridConfigurable>
    </List>
  );
};
