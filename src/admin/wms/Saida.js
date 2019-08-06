import React, { Component } from 'react'
import { Layout, Table, Icon, Button, Row, Col } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import SaidaInsumos from './SaidaInsumos'
import moment from 'moment'

const { Content } = Layout

class Saida extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Saída')
    }

    state = {
        tableData: [],
        tableLoading: false,
        showSaidaModal: false,
        idSaida: null
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    requestGetSaidas = () => {
        axios
        .get(this.props.backEndPoint + '/getSaidas')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    tableData: res.data.payload.map(saida => {
                        var dthrSaida = moment(saida.dthrSaida).format('DD/MM/YYYY H:mm:ss')
                        return({
                            idSaida: saida.idSaida,
                            usuario: {
                                id: saida.usuario.id,
                                nome: saida.usuario.nome
                            },
                            dthrSaida: dthrSaida
                        })
                    })
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    showSaidaModalF = (showSaidaModal, idSaida = null) => {
        if(idSaida != null)
            this.setState({idSaida: idSaida})
        // Se estiver fechando
        if(!showSaidaModal)
            this.setState({idSaida: null})
        this.setState({showSaidaModal})
    }

    componentDidMount(){
        this.requestGetSaidas()
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'idSaida',
            sorter: (a, b) => a.idSaida - b.idSaida,
        },
        {
            title: 'Data da Saída',
            dataIndex: 'dthrSaida',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dthrSaida, b.dthrSaida)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Editar saída" onClick={() => this.showSaidaModalF(true, record.idSaida)} />
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
                        <Tooltip title="Efetuar uma nova saída?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.showSaidaModalF(true)}><Icon type="plus" /> Nova Saida</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='idSaida'
                />
                <SaidaInsumos
                    idSaida={this.state.idSaida}
                    showSaidaModalF={this.showSaidaModalF}
                    showSaidaModal={this.state.showSaidaModal}
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

export default connect(MapStateToProps, mapDispatchToProps)(Saida)