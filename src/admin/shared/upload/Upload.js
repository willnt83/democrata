import React, { Component } from "react";
import { Layout, Alert, Tooltip, Button, Row, Col, Icon, Spin, notification } from 'antd'
import Dropzone from "./dropzone/Dropzone";
import Progress from "./progress/Progress";
import { connect } from 'react-redux'
import axios from "axios"

import "./Upload.css";

const { Content } = Layout

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {      
      files: [],
      fileNames: [],
      buttonUpload: false,
      errorOnAdded: false,
      successOnImported: false,
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false,
      UploadEndPoint: this.props.UploadEndPoint ? this.props.UploadEndPoint : 'upload'
    }

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    // this.renderActions = this.renderActions.bind(this);
  }

  styleFile = (file) => {
    if(file.error) 
      return {color: 'red'}
    else
      return null
  }

  titleFile = (file) => {
    if(file.error) 
      return file.error
    else
      return null
  }

  textFilesAccepted = (filesAccepted) => {
    let filesText = 'Somente arquivos do tipo '
    let qtdeFiles = filesAccepted.length
    filesAccepted.forEach((file,index) => {
      if(index > 0){
        if((index + 1) === qtdeFiles)
          filesText +='e '
        else
          filesText +=', '
      }
      filesText += file
    })
    if(qtdeFiles > 1)
      filesText += ' são permitidos'
    else
      filesText += ' é permitido'
    return '(' + filesText + ')';
  }

  showNotification = (msg, success) => {
    var type = null
    var style = null
    if(success){
        type = 'check-circle'
        style = {color: '#4ac955', fontWeight: '800'}
    }
    else {
        type = 'exclamation-circle'
        style = {color: '#f5222d', fontWeight: '800'}
    }
    const args = {
        message: msg,
        icon:  <Icon type={type} style={style} />,
        duration: 5
    }
    notification.open(args)
  }   

  onFilesAdded(files) {
    let filesAdd     = []
    let fileNames    = this.state.fileNames;
    let errorOnAdded = this.state.errorOnAdded;    
    files.forEach(file => {      
      if(fileNames.indexOf(file.name) === -1) {
        file.updatingStep = 0
        file.error = typeof file.error !== "undefined" ? file.error : null
        fileNames.push(file.name)
        filesAdd = filesAdd.concat(file)
        if(!errorOnAdded && file.error !== null && file.error !== '') errorOnAdded = true
      }
    })
    this.setState(prevState => ({
      errorOnAdded: errorOnAdded,
      fileNames: fileNames,
      files: prevState.files.concat(filesAdd),      
    }));
  }

  async uploadFiles() {
    if(this.state.files && this.state.files.length > 0){
      this.setState({ uploadProgress: {}, errorOnAdded: false, uploading: true });
      const promises = [];
      this.state.files.forEach((file,index) => {        
        if(!file.error || typeof file.error === 'undefined' || file.error === null || file.error === '') {
          file.index = index
          promises.push(this.sendRequest(file));
        }
      });
      try {
        if(promises && promises.length > 0){          
          await Promise.all(promises);
          this.setState({ successfullUploaded: true, buttonUpload: true, uploading: false });
        } else {
          this.setState({buttonUpload: false})
          this.showNotification('Sem arquivo(s) válido(s) para importar!', false)
        }
      } catch (e) {
        console.error(e)
        this.setState({ successfullUploaded: true, buttonUpload:false, uploading: false });
      }
    }
  }

  sendRequest(file) {
    return new Promise((resolve, reject) => {      
      const req = new XMLHttpRequest();

      req.upload.addEventListener("progress", event => {
        if (event.lengthComputable) {
          const copy = { ...this.state.uploadProgress };
          copy[file.name] = {
            state: "pending",
            percentage: (event.loaded / event.total) * 100
          };
          this.setState({ uploadProgress: copy });
        }
      });

      req.upload.addEventListener("load", event => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: "done", percentage: 100 };
        this.setState({ uploadProgress: copy });
        resolve(req.response);
      });

      req.upload.addEventListener("error", event => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: "error", percentage: 0 };
        this.setState({ uploadProgress: copy });
        reject(req.response);
      });

      // Response data
      req.onreadystatechange = (value) => {
        if (req.readyState == XMLHttpRequest.DONE) {
          let index = file.index
          file.updatingStep = 2
          if(req.responseText) {
            let jsonReturn = JSON.parse(req.responseText)
            this.showNotification(jsonReturn.msg,(jsonReturn.success ? true : false))
            if(jsonReturn.success) {
              this.setState({successOnImported: true})
            } else {
              file.error = jsonReturn.msg
            }
          }
          this.setState({[`file[${index}]`]: file, buttonUpload: false})
        }
      }

      const formData = new FormData();
      formData.append("file", file, file.name);  

      // Sendo data
      req.open("POST", this.props.backEndPoint + '/' + this.state.UploadEndPoint)
      req.send(formData);

      /*
      axios.post(this.props.backEndPoint + '/' + this.state.UploadEndPoint, formData)
      .then(res => {
          console.log(res)
          // this.showInsumosModal(false)
          // this.requestGetInsumos()
          // this.setState({buttonSalvarInsumo: false})
      })
      .catch(error =>{
          // console.log(error)
          // this.setState({buttonSalvarInsumo: false})
      })      
      */

      // stating the file
      let index = file.index
      file.updatingStep = 1;
      this.setState({[`file[${index}]`]: file})
      
    });
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
        </div>
      );
    }
  }

  // renderActions() {
  //   return (
          
  //   )
  // }

  render() {

    const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

    return (
      <div className="Upload">
          {
            this.state.errorOnAdded ? (
              <div className="ErrorAlert">
                <Alert message="Alguns arquivos não são válidos para importação!" type="error" showIcon />
              </div>
            ) : null
          } 
          {
            this.state.successOnImported ? (
              <div className="ErrorAlert">
                <Alert message="Arquivos importados com sucesso!" type="success" showIcon />
              </div>
            ) : null
          }                  
        <div className="Content">
          <div>
            <Dropzone
              filesAccepted = {this.props.filesAccepted}
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            />
          </div>
          <div className="Files">
            {this.state.files.map(file => {
              file.error = file.error ? file.error : ''
              return (
                <Row key={file.name} style={{marginBottom: '15px'}}>
                  <Col span={2}>                  
                    {
                      file.updatingStep === 1 ? (
                        <Spin spinning={file.updatingStep === 1} indicator={loadingIcon} delay={500} />
                      ) : file.updatingStep === 2 ? (
                        <Icon type="check" style={{ fontSize: 24, color: 'green' }} />
                      ) : null
                    }
                  </Col>
                  <Col span={22}>
                    <span className="Filename" style={this.styleFile(file)} title={this.titleFile(file)}>{file.name}</span>  
                  </Col>
                </Row>
                // <div key={file.name} className="Row">
                //   <span className="Filename" style={this.styleFile(file)} title={this.titleFile(file)}>{file.name}</span>
                //   {this.renderProgress(file)}
                // </div>
              );
            })}
          </div>
        </div>
        <div className="Actions">
          <Row style={{ marginBottom: 16 }}>  
            <Col span={24} style={{ textAlign: 'center', color: '#bdbdbd', fontSize: '13px' }}>
              {
                this.props.filesAccepted && this.props.filesAccepted.length > 0 ?
                (
                  <em>{this.textFilesAccepted(this.props.filesAccepted)}</em>
                ) : null
              }
            </Col>
          </Row>
          <Row style={{ marginBottom: 16 }}>  
            <Col span={4} offset={16} style={{ textAlign: 'right' }}>
              {this.state.successfullUploaded || (this.state.files && this.state.files.length > 0)  ? (
                  <Tooltip title="Apagar arquivos carregados" placement="left">
                      <Button onClick={() =>
                        this.setState({ 
                          files: [],
                          fileNames: [],
                          buttonUpload: false,
                          errorOnAdded: false,
                          successOnImported: false,
                          uploading: false,
                          uploadProgress: {},
                          successfullUploaded: false
                        })
                      }>Clear</Button>
                  </Tooltip>             
                ) : null
              }
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <Tooltip title="Carregar arquivos" placement="right">
                  <Button onClick={this.uploadFiles} loading={this.state.buttonUpload}  type="primary">Upload</Button>
              </Tooltip>
            </Col>     
          </Row>          
        </div>
      </div>
    );
  }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Upload)
