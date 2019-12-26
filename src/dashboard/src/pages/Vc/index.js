import React from "react"
import {
  Container,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Table,
  TableHead,
  TableRow, TableCell, TableBody, Button, TextField
} from "@material-ui/core";
import axios from 'axios';
import ClustersContext from "../../contexts/Clusters";

export default class Vc extends React.Component {
  static contextType = ClustersContext
  constructor() {
    super()
    this.state = {
      vcList: [],
      modifyFlag: false,
      isEdit: 0,
      vcName: '',
      quota: '',
      metadata: '',
    }
  }

  componentWillMount() {
    this.getVcList();
  }

  getVcList = () => {
    axios.get(`/api/${this.context.selectedCluster}/listVc`)
      .then((res) => {
        this.setState({
          vcList: res.data.result,
        })
      }, () => { })
  }

  //新增VC
  addVc = () => {
    this.setState({
      modifyFlag: true,
      isEdit: 0,
      vcName: '',
      quota: '',
      metadata: '',
    })
  }

  updateVc = (item) => {
    this.setState({
      modifyFlag: true,
      isEdit: 1,
      vcName: item.vcName,
      quota: item.quota,
      metadata: item.metadata,
    })
  }

  cancel = () => {
    this.setState({
      modifyFlag: false,
    })
  }

  save = () => {
    const { isEdit, vcName, quota, metadata } = this.state;
    if (!this.isJSON(quota)) {
      alert('quota必须是json格式');
      return;
    }
    if (!this.isJSON(metadata)) {
      alert('metadata必须是json格式');
      return;
    }
    let url;
    if (isEdit) {
      url = `/api/${this.context.selectedCluster}/updateVc/${vcName}/${quota}/${metadata}`;
    } else {
      url = `/api/${this.context.selectedCluster}/addVc/${vcName}/${quota}/${metadata}`;
    }
    axios.get(url)
      .then((res) => {
        alert(`${isEdit ? '修改' : '新增'}成功`)
        this.setState({ modifyFlag: false })
      }, (e) => {
        console.log(e);
        alert(`${isEdit ? '修改' : '新增'}失败`)
      })
  }

  delete = (item) => {
    const { vcList } = this.state;
    if (vcList.length === 1) {
      alert('必须保留一个vc');
      return;
    }
    if (window.confirm('确认删除')) {
      axios.get(`/api/${this.context.selectedCluster}/deleteVc/${item.vcName}`)
        .then((res) => {
          this.getVcList();
        }, () => { })
    }
    // 删除逻辑todo: 关联的表记录删除
  }

  //change
  vcNameChange(e) {
    this.setState({
      vcName: e.target.value
    })
  }

  quotaChange(e) {
    this.setState({
      quota: e.target.value
    })
  }

  metadataChange(e) {
    this.setState({
      metadata: e.target.value
    })
  }

  isJSON(str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }

  render() {
    const { vcList, modifyFlag, isEdit, vcName, quota, metadata } = this.state;
    return (
      <Container maxWidth='xl'>
        <div>
          <Button variant="outlined" size="medium" color="primary" onClick={this.addVc}>新增VC</Button>
        </div>
        <Table style={{ marginTop: 20 }}>
          <TableHead>
            <TableRow style={{ backgroundColor: '#7583d1' }}>
              <TableCell style={{ color: '#fff' }}>vcName</TableCell>
              <TableCell style={{ color: '#fff' }}>quota</TableCell>
              <TableCell style={{ color: '#fff' }}>metadata</TableCell>
              <TableCell style={{ color: '#fff' }}>actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vcList.map(item => (
              <TableRow key={item.vcName}>
                <TableCell>{item.vcName} </TableCell>
                <TableCell>{item.quota} </TableCell>
                <TableCell>{item.metadata} </TableCell>
                {
                  item.admin ?
                    <TableCell>
                      <Button color="primary" onClick={() => this.updateVc(item)}>Modify</Button>
                      <Button color="primary" onClick={() => this.delete(item)}>Delete</Button>
                    </TableCell>
                    :
                    <TableCell></TableCell>
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog fullWidth open={modifyFlag} onClose={this.cancel} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">{isEdit ? '编辑' : '新增'}</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                fullWidth
                required
                label="vcName"
                value={vcName}
                onChange={this.vcNameChange.bind(this)}
                margin="normal"
              />
              <TextField
                fullWidth
                required
                label="quota"
                multiline
                value={quota}
                onChange={this.quotaChange.bind(this)}
                margin="normal"
              />
              <TextField
                fullWidth
                required
                label="metadata"
                multiline
                value={metadata}
                onChange={this.metadataChange.bind(this)}
                margin="normal"
              />
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