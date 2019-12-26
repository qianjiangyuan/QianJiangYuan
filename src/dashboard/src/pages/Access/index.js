import React from "react"
import {
  Container,
  Typography,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Table,
  TableHead,
  TableRow, TableCell, TableBody, Button, Grid, FormControl, InputLabel, Select, MenuItem,
} from "@material-ui/core";
import axios from 'axios';
import ClustersContext from "../../contexts/Clusters";

export default class Access extends React.Component {
  static contextType = ClustersContext
  constructor(props) {
    super(props)
    this.identityName = props.match.params.identityName
    this.state = {
      vcList: [],
      accessList: [],
      modifyFlag: false,
      isEdit: 0,
      resourceType: null,
      resourceName: null,
      permissions: null,
    }
  }

  componentWillMount() {
    this.getAccessList();
    this.getVcList();
  }

  getAccessList = () => {
    axios.get(`/api/${this.context.selectedCluster}/access/${this.identityName}`)
      .then((res) => {
        this.setState({
          accessList: res.data,
        })
      }, () => { })
  }
  getVcList = () => {
    axios.get(`/api/${this.context.selectedCluster}/listVc`)
      .then((res) => {
        this.setState({
          vcList: res.data.result,
        })
      }, () => { })
  }

  addAccess = () => {
    this.setState({
      modifyFlag: true,
      isEdit: 0,
      resourceType: 1,
      resourceName: '',
      permissions: 1,
    })
  }

  updateAccess = (item) => {
    let resourceType, resourceName;
    if (item.resource === 'Cluster') {
      resourceType = 1;
      resourceName = ''
    } else {
      resourceType = 2;
      resourceName = item.resource.split(':')[1];
    }
    this.setState({
      modifyFlag: true,
      resourceType,
      resourceName,
      permissions: item.permissions,
      isEdit: 1,
    })
  }

  cancel = () => {
    this.setState({
      modifyFlag: false,
    })
  }

  save = () => {
    const { resourceType, resourceName, permissions } = this.state;
    if (resourceType === 2 && !resourceName) {
      alert(`请选择 resourceName`)
      return
    }
    let url = `/api/${this.context.selectedCluster}/updateAce?resourceType=${resourceType}&resourceName=${resourceName}&permissions=${permissions}&identityName=${this.identityName}`;
    axios.get(url).then((res) => {
      this.setState({ modifyFlag: false })
      this.getAccessList();
    }, (e) => {
      console.log(e);
      alert(`操作失败`)
    })
  }

  delete = (item) => {
    let resourceType, resourceName;
    if (window.confirm('确认删除')) {
      if (item.resource === 'Cluster') {
        resourceType = 1;
      } else {
        resourceType = 2;
        resourceName = item.resource.split(':')[1];
      }
      let url = `/api/${this.context.selectedCluster}/deleteAce?resourceType=${resourceType}&resourceName=${resourceName}&identityName=${this.identityName}`;
      axios.get(url)
        .then((res) => {
          this.getAccessList();
        }, () => { })
    }
  }


  //change
  resourceTypeChange(e) {
    this.setState({
      resourceType: e.target.value
    })
  }

  resourceNameChange(e) {
    this.setState({
      resourceName: e.target.value
    })
  }

  permissionsChange(e) {
    this.setState({
      permissions: e.target.value
    })
  }

  render() {
    const { accessList, modifyFlag, isEdit, resourceType, resourceName, permissions, vcList } = this.state;
    const PermMap = {
      0: 'Unauthorized',
      1: 'User',
      3: 'Collaborator',
      7: 'Admin'
    }
    return (
      <Container maxWidth='xl'>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Typography component="h3" variant="h6" align="left">
            Acess Permissions for {this.identityName}
          </Typography>
          <Button variant="outlined" size="medium" color="primary" onClick={this.addAccess}>ADD ACCESS</Button>
        </Grid>

        <Table style={{ marginTop: 20 }}>
          <TableHead>
            <TableRow style={{ backgroundColor: '#7583d1' }}>
              <TableCell style={{ color: '#fff' }}>resourceType</TableCell>
              <TableCell style={{ color: '#fff' }}>resourceName</TableCell>
              <TableCell style={{ color: '#fff' }}>permissions</TableCell>
              <TableCell style={{ color: '#fff' }}>actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accessList.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.resource === 'Cluster' ? 'Cluster' : 'VC'}</TableCell>
                <TableCell>{item.resource === 'Cluster' ? '-' : item.resource.split(':')[1]}</TableCell>
                <TableCell>{PermMap[item.permissions]} </TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => this.updateAccess(item)}>Modify</Button>
                  <Button color="primary" onClick={() => this.delete(item)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>


        <Dialog fullWidth open={modifyFlag} onClose={this.cancel} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">{isEdit ? 'Edit Access' : 'Add Access'}</DialogTitle>
          <DialogContent>
            <form>
              <FormControl required fullWidth disabled={isEdit}>
                <InputLabel>resourceType</InputLabel>
                <Select
                  value={resourceType}
                  onChange={this.resourceTypeChange.bind(this)}
                >
                  <MenuItem value={1}>Cluster</MenuItem>
                  <MenuItem value={2}>VC</MenuItem>
                </Select>
              </FormControl>
              {
                resourceType === 2 &&
                <FormControl required fullWidth disabled={isEdit} style={{ marginTop: 20 }}>
                  <InputLabel>resourceName</InputLabel>
                  <Select
                    value={resourceName}
                    onChange={this.resourceNameChange.bind(this)}
                  >
                    {vcList.map(item => (
                      <MenuItem key={item.vcName} value={item.vcName}>{item.vcName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              }
              <FormControl required fullWidth style={{ marginTop: 20 }}>
                <InputLabel>permissions</InputLabel>
                <Select
                  value={permissions}
                  onChange={this.permissionsChange.bind(this)}
                >
                  <MenuItem value={0}>Unauthorized</MenuItem>
                  <MenuItem value={1}>User</MenuItem>
                  <MenuItem value={3}>Collaborator</MenuItem>
                  <MenuItem value={7}>Admin</MenuItem>
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