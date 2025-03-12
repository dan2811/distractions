import {
  Create,
  DatagridConfigurable,
  DateField,
  Edit,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  type ValidateForm,
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
        <DateField
          source="lastSignIn"
          emptyText="Not logged in yet"
          showTime
          label="Last Active"
        />
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
        <TextInput source="address" />
        <TextInput source="emergencyContactName" />
        <TextInput source="emergencyContactPhone" />
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
  const validateUserCreation: ValidateForm = (values) => {
    const errors: Record<string, string> = {};
    if (values.role !== "client" && !values.email) {
      errors.email = "Email is required";
    }
    if (
      values.email &&
      typeof values.email === "string" &&
      [...values.email].some((char) => char !== char.toLowerCase())
    ) {
      errors.email = "Email must be lowercase";
    }

    const EMAIL_REGEX =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (
      values.email &&
      typeof values.email === "string" &&
      values.email.match(EMAIL_REGEX) === null
    ) {
      errors.email = "Must be a valid email address";
    }
    return errors;
  };
  return (
    <Create redirect="show">
      <SimpleForm validate={validateUserCreation}>
        <TextInput source="name" validate={required()} />
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <TextInput source="address" />
        <TextInput source="emergencyContactName" />
        <TextInput source="emergencyContactPhone" />
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
