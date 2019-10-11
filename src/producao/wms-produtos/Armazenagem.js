import React, { Component } from 'react'
import { Layout, Row, Col, Form, Icon, Button, Table, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import ModalArmazenagem from './ModalArmazenagem'

const { Content } = Layout

class Armazenagem extends Component{
    constructor(props){
        super(props)
        this.state = {
            showModalArmazenagem: false,
            idArmazenagem: null,
            tableData: []
        }
        this.handleScanLancamento = this.handleScanLancamento.bind(this)
    }

    requestGetArmazenagens = () => {
        axios
        .get(this.props.backEndPoint + '/wms-produtos/getArmazenagens')
        .then(res => {
            if(res.data.payload){
                this.setState({tableData: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
        
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
            duration: 3
        }
        notification.open(args)
    }

    handleScanLancamento(data){
        if(this.state.idFuncionario !== null){
            var request = {
                idFuncionario: this.state.idFuncionario,
                barcode: data
            }
            this.requestLancamentoProducao(request)
        }
        else{
            this.showNotification('Selecione um funcionário', false)
        }
    }

    showModalArmazenagemF = (bool, idArmazenagem = null) => {
        this.setState({showModalArmazenagem: bool, idArmazenagem})
        if(!bool)
            this.requestGetArmazenagens()
    }

    componentDidMount(){
        this.requestGetArmazenagens()
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data da Armazenagem',
            dataIndex: 'dataArmazenagem',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dataArmazenagem, b.dataArmazenagem)
        },
        {
            title: 'Usuario',
            dataIndex: 'nomeUsuario',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.nomeUsuario, b.nomeUsuario)
        },    
        {
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Alterar Armazenagem" onClick={() => this.showModalArmazenagemF(true, record.id)} />
                        {/*<Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteArmazenagem(record.id)}>
                            <a href="/admin/wms/armazem/armazenagem" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} title="Excluir Armazenagem" /></a>
                        </Popconfirm>*/}
                    </React.Fragment>
                )
            }
        }]

        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >
                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="end">
                        <Button className="buttonGreen" onClick={() => this.showModalArmazenagemF(true)}><Icon type="plus" /> Nova Armazenagem</Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='id'
                />

                <ModalArmazenagem
                    showNotification={this.showNotification}
                    idArmazenagem={this.state.idArmazenagem}
                    showModalArmazenagem={this.state.showModalArmazenagem}
                    showModalArmazenagemF={this.showModalArmazenagemF}
                />
            </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Armazenagem)))