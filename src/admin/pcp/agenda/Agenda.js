import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Button, Row, Col, notification, Divider } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'
import ModalAgendaImportacao from './ModalAgendaImportacao'
import ModalAgendaView from './ModalAgendaView'
import ModalAgendaDia from './ModalAgendaDia'

const { Content } = Layout

class Agenda extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Agenda')

    }

    state = {
        idAgenda: null,
        tableData: [],
        showAgendaModal: false,
        tableLoading: false,
        buttonSalvarAgenda: false,
        showViewAgendaModal: false
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
            duration: 2
        }
        notification.open(args)
    }

    requestGetAgendas = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getAgendas')
        .then(res => {
            var tableData = res.data.payload.map(agenda => {
                var dthrCriacaoObj = moment(agenda.dthrCriacao, 'YYYY-MM-DD H:mm:ss')
                var dthrCriacao = dthrCriacaoObj.format('DD/MM/YYYY H:mm:ss')
                return({
                    id: agenda.id,
                    dthrCriacao: dthrCriacao,
                    usuario: {
                        id: agenda.usuario.id,
                        nome: agenda.usuario.nome
                    }
                })
            })
            this.setState({tableData, tableLoading: false})
        })
        .catch(error => {
            this.setState({tableLoading: false})
            console.log(error)
        })
    }

    requestDeleteAgenda = (idAgenda) => {
        axios
        .get(this.props.backEndPoint + '/deletarAgenda?idAgenda='+idAgenda)
        .then(res => {
            this.showNotification(res.data.msg, res.data.success)
            this.requestGetAgendas()
        })
        .catch(error => {
            console.log(error)
        })
    }

    showAgendaModalF = (showAgendaModal) => {
        // Modal Agenda fechando
        if(!showAgendaModal){
            this.requestGetAgendas()
        }
        this.setState({showAgendaModal})
    }

    showViewAgendaModalF = (bool, idAgenda) => {
        this.setState({idAgenda, showViewAgendaModal: bool})
    }

    showAgendaDiaModalF = (showAgendaDiaModal) => {
        this.setState({showAgendaDiaModal})
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    componentDidMount(){
        this.requestGetAgendas()
    }

    render(){
        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                sorter: (a, b) => a.id - b.id,
            },
            {
                title: 'Usuário',
                dataIndex: 'usuario.nome',
                sorter: (a, b) => this.compareByAlph(a.usuario.nome, b.usuario.nome)
            },
            {
                title: 'Data Criação',
                dataIndex: 'dthrCriacao',
                sorter: (a, b) => this.compareByAlph(a.dthrCriacao, b.dthrCriacao)
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
                            <Icon type="eye" style={{cursor: 'pointer'}} onClick={() => this.showViewAgendaModalF(true, record.id)} />
                            <Popconfirm title="Confirmar remoção?" onConfirm={() => this.requestDeleteAgenda(record.agenda.id)}>
                                <a href="/admin/cadastros/setores" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                            </Popconfirm>
                        </React.Fragment>
                    )
                }
            }
        ]

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
                    <Col span={12}>
                        <Tooltip title="Entregas por Dia" placement="right">
                            <Button className="buttonBlue" onClick={() => this.showAgendaDiaModalF(true)}><Icon type="calendar" /> Entregas por Dia</Button>
                        </Tooltip>
                    </Col>
                    <Col span={12} align="end">
                        <Tooltip title="Importar uma nova agenda?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.showAgendaModalF(true)}><Icon type="plus" /> Nova Agenda</Button>
                        </Tooltip>
                    </Col>
                </Row>

                <Divider />
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='id'
                />

                <ModalAgendaImportacao
                    showAgendaModal={this.state.showAgendaModal}
                    showAgendaModalF={this.showAgendaModalF}
                    showNotification={this.showNotification}
                />
                <ModalAgendaView
                    idAgenda={this.state.idAgenda}
                    showViewAgendaModal={this.state.showViewAgendaModal}
                    showViewAgendaModalF={this.showViewAgendaModalF}
                />
                <ModalAgendaDia
                    showAgendaDiaModal={this.state.showAgendaDiaModal}
                    showAgendaDiaModalF={this.showAgendaDiaModalF}
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

export default connect(MapStateToProps, mapDispatchToProps)(Agenda)