import React from "react";
import { useState, useEffect } from "react";
import logo from './logo.svg';
import './App.css';
import Button from "@mui/material/Button";
import { SkynetClient } from "skynet-js";
import { FileSystemDAC } from "fs-dac-library";
import { MySky } from 'skynet-js';
import { Grid,Container } from "@mui/material";
// Initiate the SkynetClient
const portal = "https://siasky.net/";
const client = new SkynetClient(portal);
const dataDomain = "localhost";

function App() {
  const [userID, setUserID] = useState<String|null>();
  const [mySky, setMySky] = useState<any>();
  const [loggedIn, setLoggedIn] = useState<Boolean>(false);

  // On initial run, start initialization of MySky
  useEffect(() => {
    async function initMySky() {
      try {
        // load invisible iframe and define app's data domain
        // needed for permissions write
        const mySky = await client.loadMySky(dataDomain, { debug: true });
        const fileSystemDAC = new FileSystemDAC() as any;
        // load necessary DACs and permissions
        await mySky.loadDacs(fileSystemDAC);
        // check if user is already logged in with permissions
        const loggedIn = await mySky.checkLogin();
        // set react state for login status and
        // to access mySky in rest of app
        setMySky(mySky);
        setLoggedIn(loggedIn);
        if (loggedIn) {
          setUserID(await mySky.userID());
        }
      } catch (e) {
        console.error(e);
      }
    }
    // call async setup function
    initMySky();
  }, []);
  const callFileSystemOps  = async () =>
  {
    const f = new File(["Sample Skynet Data data"], "filename.txt", {type: "text/plain", lastModified: new Date(0).getTime()})
    //console.log(`mySky -> ${JSON.stringify(mySky)}`)
    console.log(`FileObject -> ${JSON.stringify(f)}`)
    await mySky.fileSystemDAC.uploadFileData(f)
    const rootDirectoryIndex = await mySky.fileSystemDAC.getDirectoryIndex("/localhost/");
    console.log(`rootDirectoryIndex -> ${rootDirectoryIndex}`)
  }
  // eslint-disable-next-line
  const handleMySkyLogin = async () => {
    // Try login again, opening pop-up. Returns true if successful
    const status = await mySky!.requestLoginAccess();
    // set react state
    setLoggedIn(status);
    if (status) {
      setUserID(await mySky!.userID());
      console.log(`Login Success: UserID ${userID}`);
    }
  };
  // eslint-disable-next-line
  const handleMySkyLogout = async () => {
    // call logout to globally logout of mysky
    await mySky!.logout();
    //set react state
    setLoggedIn(false);
    setUserID("");
    console.log(`Logout Success: UserID ${userID}`);
  };
  
  return (
    <div className="App">
      <Container maxWidth="sm">
      <Grid container spacing={2}>
      <Grid item xs={6}>
      <Button variant="contained" onClick={callFileSystemOps}>
       getDirectoryIndex
        </Button>
        </Grid>
        <Grid item xs={6}>
      {loggedIn === false && (
        <Button variant="contained" onClick={handleMySkyLogin}>
          Login
        </Button>
      )}
      {loggedIn === null && <Button>Loading MySky...</Button>}
      {loggedIn === true && (
        <Button onClick={handleMySkyLogout}>Log Out of MySky</Button>
      )}
      </Grid>
      <Grid>
      <div>{userID}</div>
      </Grid>
      </Grid>
      
      </Container>
    </div>
  );
}

export default App;
