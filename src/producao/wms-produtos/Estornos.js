import React, { Component } from 'react'
import { Layout, Form, Icon, Table, notification, Divider, Tabs } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import ComponentLancamento from './ComponentLancamento'
import moment from 'moment'

const { Content } = Layout
const { TabPane } = Tabs;

class Estornos extends Component{
    constructor(props){
        super(props)
        this.state = {
            key: 1,
            manual: false,
            idEntrada: null,
            tableData: [],
            tableLoading: false,
            ultimaDataBuscada: null
        }
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
            duration: 10
        }
        notification.open(args)
    }

    tabChange = (key) => {
        this.setState({
            key: parseInt(key),
            tableData: []
        })
    }

    componentLancamentoReturn = (msg, success) => {
        this.showNotification(msg, success)
        if(success) this.getEstornos(this.state.key)
    }

    getEstornos = (key) => {
        var uri = ''
        if(key === 1) uri = '/wms-produtos/getEstornosEntradaProduto'
        else if(key === 2) uri = '/wms-produtos/getEstornosArmazenagemProduto'
        else if(key === 3) uri = '/wms-produtos/getEstornosSaidaProduto'

        console.log('uri', uri)
        this.setState({tableLoading: true})
        axios.get(this.props.backEndPoint + uri)
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(row => {
                    var dthrEstornoObj = moment(row.dthrEstorno, 'YYYY-MM-DD H:m:s')
                    var dthrEstorno = dthrEstornoObj.format('DD/MM/YYYY H:m:s')

                    return({
                        codigoProduto: row.codigoProduto,
                        descricaoProduto: row.descricaoProduto,
                        nomeUsuario: row.nomeUsuario,
                        dthrEstorno
                    })
                })
                this.setState({tableData})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            this.setState({tableLoading: false})
            console.log(error)
        })
    }

    componentWillMount(){
        this.getEstornos(1)
    }

    componentWillUpdate(nextProps, nextState){
        // Carregando tabela na troca de abas
        if(this.state.key !== nextState.key)
            this.getEstornos(nextState.key)
    }

    render(){
        const columns = [
            {
                title: 'Cód.',
                dataIndex: 'codigoProduto',
                align: 'center',
                sorter: (a, b) => a.codigoProduto - b.codigoProduto
            },
            {
                title: 'Descrição',
                dataIndex: 'descricaoProduto',
                align: 'center',
                sorter: (a, b) => a.descricaoProduto - b.descricaoProduto
            },
            {
                title: 'Usuário',
                dataIndex: 'nomeUsuario',
                align: 'center',
                sorter: (a, b) => a.nomeUsuario - b.nomeUsuario
            },
            {
                title: 'Data',
                dataIndex: 'dthrEstorno',
                align: 'center',
                sorter: (a, b) => a.dthrEstorno - b.dthrEstorno
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
                <Tabs onChange={(key) => this.tabChange(key)} type="card">
                    <TabPane tab="Entradas" key="1">
                        <ComponentLancamento tabKey={this.state.key} componentLancamentoReturn={this.componentLancamentoReturn} />
                        <Divider />
                        <h3>Estornos de Entradas</h3>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            loading={this.state.tableLoading}
                            rowKey='codigoProduto'
                        />
                    </TabPane>
                    <TabPane tab="Armazenagens" key="2">
                        <ComponentLancamento tabKey={this.state.key} componentLancamentoReturn={this.componentLancamentoReturn} />
                        <Divider />
                        <h3>Estornos de Armazenagens</h3>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            loading={this.state.tableLoading}
                            rowKey='codigoProduto'
                        />
                    </TabPane>
                    <TabPane tab="Saídas" key="3">
                        <ComponentLancamento tabKey={this.state.key} componentLancamentoReturn={this.componentLancamentoReturn} />
                        <Divider />
                        <h3>Estornos de Saídas</h3>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            loading={this.state.tableLoading}
                            rowKey='codigoProduto'
                        />
                    </TabPane>
                </Tabs>
            </Content>
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
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Estornos)))