import {
  Create,
  DatagridConfigurable,
  Edit,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  email,
  regex,
  required,
} from "react-admin";

import {
  SavedQueriesList,
  FilterLiveSearch,
  FilterList,
  FilterListItem,
} from "react-admin";
import { Card, CardContent } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";

export const UserFilterSideBar = () => (
  <Card sx={{ order: -1, mr: 2, mt: 6, width: 250 }}>
    <CardContent>
      <SavedQueriesList />
      <FilterLiveSearch source="name" label="Search by name" />
      <FilterList label="Role" icon={<BadgeIcon />}>
        <FilterListItem label="Musician" value={{ role_enum: "musician" }} />
        <FilterListItem label="Client" value={{ role_enum: "client" }} />
        <FilterListItem label="Admin" value={{ role_enum: "admin" }} />
        <FilterListItem
          label="Super Admin"
          value={{ role_enum: "superAdmin" }}
        />
      </FilterList>
    </CardContent>
  </Card>
);

export const UserList = () => {
  return (
    <List aside={<UserFilterSideBar />}>
      <DatagridConfigurable
        rowClick="show"
        omit={["id"]}
        bulkActionButtons={false}
      >
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="role" />
      </DatagridConfigurable>
    </List>
  );
};

export const UserEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <SelectInput
          source="role"
          choices={[
            { id: "superAdmin", name: "Super Admin" },
            { id: "admin", name: "Admin" },
            { id: "musician", name: "Musician" },
            { id: "client", name: "Client" },
          ]}
        />
        <ReferenceArrayInput source="instruments" reference="instrument" />
      </SimpleForm>
    </Edit>
  );
};

export const UserCreate = () => {
  return (
    <Create redirect="show">
      <SimpleForm>
        <TextInput source="name" validate={required()} />
        <TextInput
          source="email"
          type="email"
          validate={[
            required(),
            email("Must be a valid email address"),
            (val: string) => {
              if ([...val].some((char) => char !== char.toLowerCase())) {
                return "Email must be lowercase";
              }
              return;
            },
          ]}
        />
        <TextInput source="phone" />
        <SelectInput
          source="role"
          choices={[
            { id: "superAdmin", name: "Super Admin" },
            { id: "admin", name: "Admin" },
            { id: "musician", name: "Musician" },
            { id: "client", name: "Client" },
          ]}
          validate={required("You must select a role")}
        />
        <ReferenceArrayField source="instruments" reference="Instrument" />
      </SimpleForm>
    </Create>
  );
};
