import React from "react"
import {
  Container,
  Table,
  TableHead,
  TableRow, TableCell, TableBody, Button, Switch
} from "@material-ui/core";
import { Link } from "react-router-dom";
import axios from 'axios';
import ClustersContext from "../../contexts/Clusters";

export default class User extends React.Component {
  static contextType = ClustersContext
  constructor() {
    super()
    this.state = {
      userList: []
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

  changeAdmin = (item) => {
    let url = `/api/${this.context.selectedCluster}/updateUser/${item.userName}?isAdmin=${item.isAdmin ^ 1}`;
    axios.get(url).then(() => {
      this.getUserList();
    }, (e) => {
      console.log(e);
    })
  }

  //change
  isRoleChange(e) {
    this.setState({
      isAdmin: e.target.value & 1
    })
  }

  render() {
    const { userList } = this.state;
    return (
      <Container maxWidth='xl'>
        <Table style={{ float: 'left' }}>
          <TableHead>
            <TableRow style={{ backgroundColor: '#7583d1' }}>
              <TableCell style={{ color: '#fff' }}>group</TableCell>
              <TableCell style={{ color: '#fff' }}>openId</TableCell>
              <TableCell style={{ color: '#fff' }}>nickName</TableCell>
              <TableCell style={{ color: '#fff' }}>userName</TableCell>
              <TableCell style={{ color: '#fff' }}>isAdmin</TableCell>
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
                <TableCell>
                  <Switch
                    checked={item.isAdmin > 0}
                    color="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    onChange={() => this.changeAdmin(item)}
                  />
                </TableCell>
                <TableCell>
                  <Button color="primary" component={Link} to={`/user/access/${item.userName}`}>Access</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    )
  }
}