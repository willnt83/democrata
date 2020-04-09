import React, { Component } from 'react'
import { Table, Icon, Modal, Button, Row, Col, Divider, DatePicker } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

const today = moment().format('DD/MM/YYYY')

class ModalAgendaDia extends Component {
    state = {
        tableData: [],
        tableLoading: false,
        showTable: false
    }
 
    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    requestGetAgenda = (dataAcordada) => {
        this.setState({tableLoading: true})
        var dataAcordadaObj = moment(dataAcordada, 'DD/MM/YYYY')
        axios
        .get(this.props.backEndPoint+'/getAgenda?dt_acordada='+dataAcordadaObj.format('YYYY-MM-DD'))
        .then(res => {
            if(res.data.payload.length > 0) this.setState({showTable: true})
            var tableData = res.data.payload.map(produto => {
                var dtAcordadaObj = moment(produto.dtAcordada, 'YYYY-MM-DD')
                var dtAcordada = dtAcordadaObj.format('DD/MM/YYYY')
                var dtProducaoObj = moment(produto.dtProducao, 'YYYY-MM-DD')
                var dtProducao = dtProducaoObj.format('DD/MM/YYYY')
                var dtAgendamentoObj = moment(produto.dtAgendamento, 'YYYY-MM-DD')
                var dtAgendamento = dtAgendamentoObj.format('DD/MM/YYYY')

                return({
                    idAgenda: produto.idAgenda,
                    idRegistro: produto.idRegistro,
                    fornecedor: produto.fornecedor,
                    observacao: produto.observacao,
                    sku: produto.sku,
                    codFornecedor: produto.codFornecedor,
                    corProduto: produto.corProduto,
                    nomeProduto: produto.nomeProduto,
                    quantidade: produto.quantidade,
                    volumes: produto.volumes,
                    situacao: produto.situacao,
                    dtAcordada: dtAcordada,
                    dtProducao: dtProducao,
                    diasAtraso: produto.diasAtraso,
                    dtAgendamento: dtAgendamento,
                    agendaMobly: produto.agendaMobly
                })
            })
            this.setState({tableData, tableLoading: false})
        })
        .catch(error => {
            this.setState({tableLoading: false})
            console.log(error)
        })
    }


    componentWillReceiveProps(nextProps){
        if(!this.props.showAgendaDiaModal && nextProps.showAgendaDiaModal){
            this.requestGetAgenda(today)
        }
    }

    render(){
        const columns = [
        {
            title: 'ID Agenda',
            dataIndex: 'idAgenda',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Data Acordada',
            dataIndex: 'dtAcordada',
            sorter: (a, b) => this.compareByAlph(a.dtAcordada, b.dtAcordada)
        },
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
                title="Agenda - Entregas por Dia"
                visible={this.props.showAgendaDiaModal}
                onCancel={() => this.props.showAgendaDiaModalF(false, null)}
                width={1200}
                maskClosable={false}
                footer={[
                    <Button key="back" onClick={() => this.props.showAgendaDiaModalF(false, null)}><Icon type="close" /> Fechar</Button>
                ]}
            >
                <Row>
                    <Col span={24} id="colSelectDate">
                        <DatePicker
                            locale={ptBr}
                            defaultValue={moment(today, 'DD/MM/YYYY')}
                            format="DD/MM/YYYY"
                            style={ {width: '30%'} }
                            getCalendarContainer={() => document.getElementById('colSelectDate')}
                            onChange={(date, datestring) => this.requestGetAgenda(date)}
                        />
                    </Col>
                </Row>
                {
                    this.state.showTable ?
                    <React.Fragment>
                        <Divider />
                        <Row>
                            <Col
                                span={24}
                                style={{
                                    overflowX: 'scroll',
                                    overflowY: 'scroll',
                                    whiteSpace: 'nowrap',
                                    maxHeight: '600px'
                                }}
                            >
                                <Table
                                    columns={columns}
                                    dataSource={this.state.tableData}
                                    rowKey='id'
                                    style={{
                                        display: 'inline-block'
                                    }}
                                    pagination={false}
                                />
                            </Col>
                        </Row>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Divider />
                        <h4>
                            Nenhuma entrega agendada
                        </h4>
                    </React.Fragment>

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

export default connect(MapStateToProps, mapDispatchToProps)(ModalAgendaDia)