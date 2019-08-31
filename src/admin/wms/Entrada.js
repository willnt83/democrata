import React, { Component } from 'react'
import { Layout, Table, Icon, Button, Row, Col, Tooltip, Form, Popconfirm, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'

import EntradaInsumos from './EntradaInsumos'

const { Content } = Layout

class ArmazemEntrada extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Entrada de Insumos')
    }

    state = {
        idEntrada: null,
        tableLoading: false,
        tableData: [],
        showEntradaModal: false,
        dynamicFieldsRendered: false,
        btnSalvarLoading: false
    }

    requestGetEntradaInsumos = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getEntradaInsumos')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    tableData: res.data.payload.map(entrada => {
                        return({
                            id: entrada.id,
                            usuario: {
                                id: entrada.idUsuario,
                                nome: entrada.nomeUsuario
                            },
                            dthr_entrada: moment(entrada.data_entrada+' '+entrada.hora_entrada).format('DD/MM/YYYY H:mm:ss')
                        })
                    })
                })              
            }
            else
                console.log('Nenhum registro encontrado')            
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    handleDeleteEntrada = (key) => {
        axios
        .get(this.props.backEndPoint + '/deleteEntrada?id='+key)
        .then(res => {
            this.showNotification(res.data.msg, res.data.success)
            this.requestGetEntradaInsumos()
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetEntradaInsumosF = () => {
        this.setState({idEntrada: null})
        this.requestGetEntradaInsumos()
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

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    showEntradaModalF = (showEntradaModal, idEntrada = null) => {
        if(idEntrada != null)
            this.setState({idEntrada: idEntrada})
            
        // Se estiver fechando
        if(!showEntradaModal)
            this.setState({idEntrada: null})

       this.setState({showEntradaModal})
    }

    componentDidMount(){
        this.requestGetEntradaInsumos()
    }

    render(){            
        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data da Entrada',
            dataIndex: 'dthr_entrada',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dthr_entrada, b.dthr_entrada)
        },
        {
            title: 'Usuario',
            dataIndex: 'usuario.nome',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.usuario.nome, b.usuario.nome)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Alterar Entrada" onClick={() => this.showEntradaModalF(true, record.id)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteEntrada(record.id)}>
                            <a href="/admin/wms/armazem/entrada" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} title="Excluir Entrada" /></a>
                        </Popconfirm>
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
                        <Tooltip title="Cadastrar Nova Entrada de Insumos" placement="right">
                            <Button className="buttonGreen" onClick={() => this.showEntradaModalF(true)}><Icon type="plus" /> Nova Entrada</Button>
                        </Tooltip>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='id'
                />
                    <EntradaInsumos
                        idEntrada={this.state.idEntrada}
                        showEntradaModalF={this.showEntradaModalF}
                        showEntradaModal={this.state.showEntradaModal}
                        requestGetEntradaInsumosF={this.requestGetEntradaInsumosF}
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
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazemEntrada))