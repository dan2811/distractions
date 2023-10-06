import { Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useSession } from "next-auth/react";
import { Title } from "react-admin";

const Dashboard = () => {
  const session = useSession();
  const user = session?.data?.user;
  return (
    <Card sx={{ marginTop: 1 }}>
      <Title title="Admin console" />
      <CardContent>
        <Typography variant="h4">Welcome {user?.name ?? ""}</Typography>
        <br />
        <article>
          <Typography variant="body1">
            This is the admin console. Use the menu on the left to navigate
            through different entities.
          </Typography>
          <Typography variant="body1">
            Each entity is made up of:
            <ul style={{ listStyle: "inside" }}>
              <li>List page - an overview of every item</li>
              <li>
                Show page - a detailed view of a single item and its relations
              </li>
              <li>Edit page - a form to edit the details of the item</li>
              <li>Create page - a form to create a new item</li>
            </ul>
          </Typography>
        </article>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
