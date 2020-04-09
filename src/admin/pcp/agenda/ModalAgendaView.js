import React, { Component } from 'react'
import { Table, Icon, Modal, Button, Row, Col, Divider } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'

class ModalAgendaView extends Component {
    state = {
        tableData: [],
        tableLoading: false
    }
 
    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    requestGetAgenda = (idAgenda) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint+'/getAgenda?id_agenda='+idAgenda)
        .then(res => {
            var tableData = res.data.payload.map(produto => {
                var dtAcordadaObj = moment(produto.dtAcordada, 'YYYY-MM-DD')
                var dtAcordada = dtAcordadaObj.format('DD/MM/YYYY')
                var dtProducaoObj = moment(produto.dtProducao, 'YYYY-MM-DD')
                var dtProducao = dtProducaoObj.format('DD/MM/YYYY')
                var dtAgendamentoObj = moment(produto.dtAgendamento, 'YYYY-MM-DD')
                var dtAgendamento = dtAgendamentoObj.format('DD/MM/YYYY')

                return({
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
        if(!this.props.showViewAgendaModal && nextProps.showViewAgendaModal && this.props.idAgenda !== ''){
            this.requestGetAgenda(nextProps.idAgenda)
        }
    }

    render(){
        const title = 'Agenda - ID:'+this.props.idAgenda
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
                title={title}
                visible={this.props.showViewAgendaModal}
                onCancel={() => this.props.showViewAgendaModalF(false, null)}
                width={1200}
                maskClosable={false}
                footer={[
                    <Button key="back" onClick={() => this.props.showViewAgendaModalF(false, null)}><Icon type="close" /> Fechar</Button>
                ]}
            >
                <Row>
                    <Col span={24}>

                    </Col>
                </Row>
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
                            loading={this.state.tableLoading}
                            rowKey='idRegistro'
                            style={{
                                display: 'inline-block'
                            }}
                            pagination={false}
                        />
                    </Col>
                </Row>
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

export default connect(MapStateToProps, mapDispatchToProps)(ModalAgendaView)