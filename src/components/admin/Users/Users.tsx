import {
  DatagridConfigurable,
  Edit,
  List,
  ReferenceArrayInput,
  ReferenceInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  useGetMany,
  useGetManyReference,
  useRecordContext,
} from "react-admin";

export const UserList = () => {
  return (
    <List>
      <DatagridConfigurable rowClick="show" omit={["id"]}>
        <TextField source="id" />
        <TextField source="name" />
      </DatagridConfigurable>
    </List>
  );
};

export const UserShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="email" />
        <TextField source="phone" />
      </SimpleShowLayout>
    </Show>
  );
};

export const UserEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="fName" />
        <TextInput source="lName" />
        <TextInput source="email" />
        <TextInput source="phone" />
        <ReferenceInput source="teacherId" reference="teacherInstrument">
          <ReferenceArrayInput
            source="instrumentId"
            reference="instrument"
            helperText={false}
          />
        </ReferenceInput>
        <CustomReferenceSelect />
      </SimpleForm>
    </Edit>
  );
};

const CustomReferenceSelect = () => {
  const record = useRecordContext();
  interface Instrument {
    id: string;
    teacherId: string;
    instrumentId: string;
  }
  const { data } = useGetManyReference<Instrument>("teacherInstrument", {
    target: "teacherId",
    id: record.id,
  });
  console.log(data);

  const { data: instruments } = useGetMany("instrument", {
    ids: data?.map((el) => el.instrumentId),
  });

  console.log("INSTRUMENTS: ", instruments);
  return <></>;
};
