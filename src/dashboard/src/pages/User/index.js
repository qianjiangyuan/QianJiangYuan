import React from "react"
import {
  Container,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField,
  Table,
  TableHead,
  TableRow, TableCell, TableBody, Button, FormControl, InputLabel, Select, MenuItem,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import axios from 'axios';
import ClustersContext from "../../contexts/Clusters";

export default class User extends React.Component {
  static contextType = ClustersContext
  constructor() {
    super()
    this.state = {
      userList: [],
      modifyFlag: false,
      userName: '',
      isAdmin: null,
      isAuthorized: null,
    }
  }

  componentWillMount() {
    this.getUserList();
  }

  getUserList = () => {
    axios.get(`/api/${this.context.selectedCluster}/listUser`)
      .then((res) => {
        this.setState({
          userList: res.data,
        })
      }, () => { })
  }

  updateUser = (item) => {
    this.setState({
      modifyFlag: true,
      userName: item.userName,
      isAdmin: item.isAdmin,
      isAuthorized: item.isAuthorized,
    })
  }

  cancel = () => {
    this.setState({
      modifyFlag: false,
    })
  }

  save = () => {
    const { isAdmin, isAuthorized, userName } = this.state;
    let url = `/api/${this.context.selectedCluster}/updateUserPerm/${isAdmin}/${isAuthorized}/${userName}`;
    axios.get(url).then(() => {
      alert(`修改成功`)
      this.setState({ modifyFlag: false })
      this.getUserList();
    }, (e) => {
      console.log(e);
      alert(`修改失败`)
    })
  }

  //change
  isRoleChange(e) {
    this.setState({
      isAdmin: e.target.value >> 1 & 1,
      isAuthorized: e.target.value & 1
    })
  }

  render() {
    const { userList, modifyFlag, userName, isAdmin, isAuthorized } = this.state;
    return (
      <Container maxWidth='xl'>
        <Table style={{ float: 'left' }}>
          <TableHead>
            <TableRow style={{ backgroundColor: '#7583d1' }}>
              <TableCell style={{ color: '#fff' }}>group</TableCell>
              <TableCell style={{ color: '#fff' }}>openId</TableCell>
              <TableCell style={{ color: '#fff' }}>nickName</TableCell>
              <TableCell style={{ color: '#fff' }}>userName</TableCell>
              <TableCell style={{ color: '#fff' }}>userRole</TableCell>
              <TableCell style={{ color: '#fff' }}>actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userList.map(item => (
              <TableRow key={item.uid}>
                <TableCell>{item.group} </TableCell>
                <TableCell>{item.openId} </TableCell>
                <TableCell>{item.nickName} </TableCell>
                <TableCell>{item.userName}</TableCell>
                <TableCell>{item.isAdmin ? '管理员' : (item.isAuthorized ? '用户' : '未认证')} </TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => this.updateUser(item)}>Modify</Button>
                  <Button color="primary" component={Link} to={`/user/${this.context.selectedCluster}/${item.userName}`}>Access</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog fullWidth open={modifyFlag} onClose={this.cancel} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Modify userRole</DialogTitle>
          <DialogContent>
            <form>
              <FormControl fullWidth>
                <TextField
                  disabled
                  label="userName"
                  defaultValue={userName}>
                </TextField>
              </FormControl>
              <FormControl fullWidth style={{ marginTop: 20 }}>
                <InputLabel>userRole</InputLabel>
                <Select
                  value={isAdmin * 2 + isAuthorized}
                  onChange={this.isRoleChange.bind(this)}
                >
                  <MenuItem value={3}>管理员</MenuItem>
                  <MenuItem value={1}>用户</MenuItem>
                  <MenuItem value={0}>未认证</MenuItem>
                </Select>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancel} color="primary">
              Cancel
          </Button>
            <Button onClick={this.save} color="primary">
              Save
          </Button>
          </DialogActions>
        </Dialog>
      </Container>
    )
  }
}