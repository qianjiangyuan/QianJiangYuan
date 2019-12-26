import React from "react";

import { RouteComponentProps } from "react-router-dom"

import { Box, Grid, Paper, Typography, Button, CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import image1 from "./image1.jpeg";
import image2 from "./image2.jpeg";
import image3 from "./image3.jpeg";

import UserContext from "../../contexts/User";

const useStyles = makeStyles(() => createStyles({
  container: {
    backgroundImage: `url(${[image1, image2, image3][Date.now() % 3]})`,
    backgroundSize: "cover",
    backgroundPosition: "right"
  }
}));

const SignIn: React.FC<RouteComponentProps> = ({ history }) => {
  enum SIGNIN_STATUS {
    Initial = 0,
    Microsoft,
    Dingtalk,
    Zhejianglab
  }
  const { openId, group } = React.useContext(UserContext);
  const [signInStatus, setSignInStatus] = React.useState(SIGNIN_STATUS.Initial);
  const onButtonClick = React.useCallback((status) => {
    setSignInStatus(status);
  }, []);

  React.useEffect(() => {
    if (openId !== undefined && group !== undefined) {
      history.replace('/');
    }
  }, [openId, group, history])

  const styles = useStyles();

  return (
    <Grid container justify="flex-end" className={styles.container}>
      <Grid
        item xl={4} lg={5} md={6} sm={8} xs={12} zeroMinWidth
        container alignItems="stretch" justify="flex-end"
      >
        <Paper square elevation={6}>
          <Box paddingTop={10} paddingRight={5} paddingBottom={10} paddingLeft={5} minHeight="100%" display="flex">
            <Grid container direction="column" spacing={10} alignItems="center" justify="space-between">
              <Grid item>
                <Typography variant="h2" component="h1" align="center">
                  钱江源开源开放平台
                </Typography>
              </Grid>

              <Grid container direction="column" alignItems="center" justify="space-between" style={{ height: 150 }}>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    href="/api/authenticate"
                    disabled={signInStatus !== SIGNIN_STATUS.Initial}
                    onClick={() => onButtonClick(SIGNIN_STATUS.Microsoft)}
                  >
                    {signInStatus === SIGNIN_STATUS.Microsoft ? <CircularProgress size={24} /> : 'Sign in with Microsoft'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    href="/api/authenticate/dingtalk"
                    disabled={signInStatus !== SIGNIN_STATUS.Initial}
                    onClick={() => onButtonClick(SIGNIN_STATUS.Dingtalk)}
                  >
                    {signInStatus === SIGNIN_STATUS.Dingtalk ? <CircularProgress size={24} /> : 'Sign in with Dingtalk'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    href="/api/authenticate/zjlab"
                    disabled={signInStatus !== SIGNIN_STATUS.Initial}
                    onClick={() => onButtonClick(SIGNIN_STATUS.Zhejianglab)}
                  >
                    {signInStatus === SIGNIN_STATUS.Zhejianglab ? <CircularProgress size={24} /> : 'Sign in with Zhejianglab'}
                  </Button>
                </Grid>
              </Grid>

              <Grid item>
                <Typography variant="body2">
                  {"Built with "}
                  <span role="img" aria-label="heart">❤️</span>
                  {" by QianJiangYuan Team"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SignIn;
