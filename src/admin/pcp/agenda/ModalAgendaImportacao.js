import React, { Component } from 'react'
import { Table, Icon, Modal, Button, Row, Col, Divider } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import classNames from 'classnames'
import Dropzone from 'react-dropzone'

class ModalAgendaImportacao extends Component {
    state = {
        tableData: [],
        btnLoading: false,
        showTable: false,
        btnLoadingSalvar: false
    }
 
    onDrop = (acceptedFiles) => {
        this.setState({
            showTable: false,
            btnLoading: true
        })
        var reader = new FileReader()
        reader.readAsDataURL(acceptedFiles[0])
        reader.onload = (event) => {
            var bodyFormData = new FormData()
            bodyFormData.append('file', acceptedFiles[0])
            axios({
                method: 'post',
                url: this.props.backEndPoint + '/importarAgenda',
                data: bodyFormData,
                config: { headers: {'Content-Type': 'multipart/form-data' }}
            })
            .then(res => {
                this.setState({
                    tableData: res.data.payload,
                    btnLoading: false,
                    showTable: true
                })
            })
            .catch(error =>{
                console.log(error)
                this.setState({
                    btnLoading: false,
                    showTable: false
                })
            })
        }
        reader.onerror = function (error) {
            console.log('Error: ', error)
            return false
        }
    }

    salvarAgenda = () => {
        this.setState({btnLoadingSalvar: true})
        var request = {
            idUsuario: this.props.session.usuario.id,
            registros: this.state.tableData
        }

        axios.post(this.props.backEndPoint + '/salvarAgenda', request)
        .then(res => {
            this.props.showNotification(res.data.msg, res.data.success)
            this.props.showAgendaModalF(false)
            this.setState({btnLoadingSalvar: false, tableData: [], showTable: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({btnLoadingSalvar: false})
        })
    }
    
    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    render(){
        const columns = [
        {
            title: 'ID',
            dataIndex: 'idRegistro',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Fornecedor',
            dataIndex: 'fornecedor',
            sorter: (a, b) => this.compareByAlph(a.fornecedor, b.fornecedor)
        },
        {
            title: 'Observação',
            dataIndex: 'observacao',
            sorter: (a, b) => this.compareByAlph(a.observacao, b.observacao)
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            sorter: (a, b) => this.compareByAlph(a.sku, b.sku)
        },
        {
            title: 'Cód. Forn.',
            dataIndex: 'codFornecedor',
            sorter: (a, b) => this.compareByAlph(a.codFornecedor, b.codFornecedor)
        },
        {
            title: 'Cor Produto',
            dataIndex: 'corProduto',
            sorter: (a, b) => this.compareByAlph(a.corProduto, b.corProduto)
        },
        {
            title: 'Descrição',
            dataIndex: 'nomeProduto',
            sorter: (a, b) => this.compareByAlph(a.nomeProduto, b.nomeProduto)
        },
        {
            title: 'Quant.',
            dataIndex: 'quantidade',
            sorter: (a, b) => a.quantidade - b.quantidade,
        },
        {
            title: 'Volumes',
            dataIndex: 'volumes',
            sorter: (a, b) => a.volumes - b.volumes,
        },
        {
            title: 'Situação',
            dataIndex: 'situacao',
            sorter: (a, b) => this.compareByAlph(a.situacao, b.situacao)
        },
        {
            title: 'Data Acordada',
            dataIndex: 'dtAcordada',
            sorter: (a, b) => this.compareByAlph(a.dtAcordada, b.dtAcordada)
        },
        {
            title: 'Data de Produção',
            dataIndex: 'dtProducao',
            sorter: (a, b) => this.compareByAlph(a.dtProducao, b.dtProducao)
        },
        {
            title: 'Dias de Atraso',
            dataIndex: 'diasAtraso',
            sorter: (a, b) => this.compareByAlph(a.diasAtraso, b.diasAtraso)
        },
        {
            title: 'Data Agendamento',
            dataIndex: 'dtAgendamento',
            sorter: (a, b) => this.compareByAlph(a.dtAgendamento, b.dtAgendamento)
        },
        {
            title: 'Agenda Mobly',
            dataIndex: 'agendaMobly',
            sorter: (a, b) => this.compareByAlph(a.agendaMobly, b.agendaMobly)
        }]

        return(
            <Modal
                title="Importação de Agenda"
                visible={this.props.showAgendaModal}
                onCancel={() => this.props.showAgendaModalF(false)}
                width={1200}
                maskClosable={false}
                footer={[
                    <Button key="back" onClick={() => this.props.showAgendaModalF(false)}><Icon type="close" /> Cancelar</Button>,
                    <Button key="submit" type="primary" loading={this.state.btnLoadingSalvar} onClick={() => this.salvarAgenda()}><Icon type="save" /> Salvar</Button>
                ]}
            >
                <Row>
                    <Col span={24}>

                        <Dropzone 
                            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onDrop={this.onDrop}
                        >
                            {({getRootProps, getInputProps, isDragActive}) => {
                                return (
                                    <div
                                        {...getRootProps()}
                                        className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
                                    >
                                        <input {...getInputProps()} />
                                        {
                                            <Button loading={this.state.btnLoading}><Icon type="upload" />Carregar Planilha</Button>
                                        }
                                    </div>
                                )
                            }}
                        </Dropzone>
                    </Col>
                </Row>
                {
                    this.state.showTable ?
                    <React.Fragment>
                        <Divider />
                        <Row>
                            <Col span={24}
                            style={{
                                overflowX: 'scroll',
                                overflowY: 'hidden',
                                whiteSpace: 'nowrap'
                            }}>
                                <Table
                                    columns={columns}
                                    dataSource={this.state.tableData}
                                    rowKey='idRegistro'
                                    style={{
                                        display: 'inline-block'
                                    }}
                                />
                            </Col>
                        </Row>
                    </React.Fragment>:null
                }
            </Modal>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(ModalAgendaImportacao)