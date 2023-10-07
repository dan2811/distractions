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
        <Typography variant="h4">
          Hello{user?.name ? " " + user.name : ""},
        </Typography>
        <br />
        <Typography variant="h5">
          Welcome to the admin console. Here is some info to get you started.
        </Typography>

        <Typography variant="h6" mt={2}>
          Navigation
        </Typography>
        <Typography variant="body1">
          <ul style={{ listStyle: "inside" }}>
            <li>
              Use the main menu (top left) to navigate through different
              entities.
            </li>
            <li>
              Click the profile icon (top right) to logout or go back to the
              main app.
            </li>
          </ul>
        </Typography>
        <Typography variant="h6" mt={2}>
          Entities
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
        <Typography variant="h6" mt={2}>
          Intended workflow
        </Typography>
        <Typography variant="body1">
          The system has been designed with the following workflow in mind,{" "}
          <strong>after</strong> a booking comes in and the initial details have
          been agreed with the client:
        </Typography>
        <Typography variant="body1" mt={1}>
          <ol
            style={{
              listStyleType: "-moz-initial",
              listStylePosition: "inside",
            }}
          >
            <li>
              Admin creates a new client and event, and assigns the event to the
              client.
            </li>
            <li>
              Admin offers the gig out to musicians by adding them to the event.
            </li>
            <li>Musicians log in and accept/decline the gig.</li>
            <li>
              Client logs in and updates the details of their event and makes
              their payments using the paypal integration.
            </li>
          </ol>
        </Typography>
        <Typography variant="body1" mt={2}>
          Future iterations of the app will extend this workflow to include
          musicians sending/uploading their invoices through this app and
          documents being automatically generated.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
