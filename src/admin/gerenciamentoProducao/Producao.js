import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, DatePicker, Divider } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

const { Content } = Layout
let id = 0

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class Producao extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Produção')
    }

    state = {
        tableData: [],
        showProducaoModal: false,
        produtosSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        produtosOptions: [],
        idProducao: null,
        buttonSalvarProducaoLoading: false,
        dynamicFieldsRendered: false,
        produtos: []
    }

    requestGetProducoes = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getProducoes')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(producao => {
                    var ativo = producao.ativo === 'Y' ? 'Sim' : 'Não'
                    var dataInicialObj = moment(producao.dataInicial, 'YYYY-MM-DD')
                    var dataInicial = dataInicialObj.format('DD/MM/YYYY')
                    return({
                        key: producao.id,
                        nome: producao.nome,
                        dataInicialValue: dataInicialObj,
                        dataInicialDescription: dataInicial,
                        ativoValue: producao.ativo,
                        ativoDescription: ativo,
                        produtos: producao.produtos
                    })
                })
                console.log('tableData', tableData)
                this.setState({tableData})
            }
            else
                console.log('Nenhum registro encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    requestCreateUpdateProducao = (request) => {
        this.setState({buttonSalvarProducaoLoading: true})
        axios.post(this.props.backEndPoint + '/createUpdateProducao', request)
        .then(res => {
            console.log('response', res.data.payload)
            this.showProducaoModal(false)
            this.requestGetProducoes()
            this.setState({buttonSalvarProducaoLoading: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarProducaoLoading: false})
        })
    }

    handleDeletePcp = () => {

    }

    loadProdutosOptions = () => {
        axios
        .get(this.props.backEndPoint + '/getProdutos?ativo=Y')
        .then(res => {
            if(res.data.success){
                this.setState({
                    produtosOptions: res.data.payload.map(produto => {
                        return({
                            value: produto.id,
                            description: produto.nome + ' ('+produto.cor+')'
                        })
                    }),
                    produtosSelectStatus: {
                        placeholder: 'Selecione o produto',
                        disabled: false
                    }
                })
            }
            else
                console.log(res.data.message)
        })
        .catch(error => {
            console.log(error)
        })
    }

    loadProducaoModal = (record) => {
        this.loadProdutosOptions()
        if(typeof(record) !== "undefined"){
            // Edit
            var keys = record.produtos.map((produtos, index) => {
                return(index)
            })

            this.props.form.setFieldsValue({
                nome: record.nome,
                dataInicial: record.dataInicialValue,
                ativo: record.ativoValue,
                keys
            })

            this.setState({
                idProducao: record.key,
                dynamicFieldsRendered: true,
                produtos: record.produtos
            })
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showProducaoModal(true)
    }

    showProducaoModal = (bool) => {
        this.setState({showProducaoModal: bool})
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var id = this.state.idProducao ? this.state.idProducao : null
                var produtos = null
                if(values.produtos.length > 0){
                    produtos = values.produtos
                    .map((produto, index) => {
                        return ({
                            id: produto,
                            quantidade: parseInt(values.produtosQtde[index])
                        })
                    })
                    .filter(produto => {
                        return produto !== null
                    })
                }

                var request = {
                    id: id,
                    nome: values.nome,
                    dataInicial: values.dataInicial.format('YYYY-MM-DD'),
                    ativo: values.ativo,
                    produtos
                }

                this.requestCreateUpdateProducao(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)

        form.setFieldsValue({
            keys: nextKeys,
        })
    }

    removeComposicaoRow = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        // We need at least one passenger
        if (keys.length === 1){
            return
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    goToAcompanharProducao = (record) => {
        if(record === 'undefined'){
            this.props.resetProducaoMainData()
        }
        else{
            this.props.setProducaoMainData(record)
        }
        this.props.history.push('/admin/producao/acompanhamento')
    }

    componentWillMount(){
        this.requestGetProducoes()
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){
            var produtos = this.state.produtos.map(produto => {
                return(produto.id)
            })
            var produtosQtde = this.state.produtos.map(produto => {
                return(produto.quantidade)
            })

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.produtos.length)

            this.props.form.setFieldsValue({
                produtos,
                produtosQtde
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const composicaoItems = keys.map((k, index) => (
            <Row key={k} gutter={5}>
                <Col span={18}>
                    <Form.Item>
                        {getFieldDecorator(`produtos[${k}]`, {
                            rules: [{
                                required: true, message: "Informe o subproduto"
                            }],
                        })(
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder={this.state.produtosSelectStatus.placeholder}
                                disabled={this.state.produtosSelectStatus.disabled}
                                getPopupContainer={() => document.getElementById('colCadastroPCP')}
                                allowClear={true}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    this.state.produtosOptions.map((option) => {
                                        return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {getFieldDecorator(`produtosQtde[${k}]`, {
                            rules: [{
                                required: true, message: "Informe a quantidade"
                            }],
                        })(
                            <Input
                                style={{ width: '75%', marginRight: 8 }}
                                placeholder="Qtd"
                            />
                        )}
                        {keys.length > 1 ? (
                            <Icon
                                className="dynamic-delete-button"
                                type="minus-circle-o"
                                disabled={keys.length === 1}
                                onClick={() => this.removeComposicaoRow(k)}
                            />
                        ) : null}
                    </Form.Item>
                </Col>
            </Row>
        ))

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Descrição',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.nome, b.nome)
        },
        {
            title: 'Data Inicial',
            dataIndex: 'dataInicialDescription',
            sorter: (a, b) => this.compareByAlph(a.dataInicialDescription, b.dataInicialDescription)
        },
        {
            title: 'Ativo',
            dataIndex: 'ativoDescription',
            align: 'center',
            width: 150,
            filters: [{
                text: 'Ativo',
                value: 'Ativo',
            }, {
                text: 'Inativo',
                value: 'Inativo',
            }],
            filterMultiple: false,
            onFilter: (value, record) => record.ativoDescription.indexOf(value) === 0
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
                        <Icon type="eye" style={{cursor: 'pointer'}} title="Acompanhar produção" onClick={() => this.goToAcompanharProducao(record)} />
                        <Icon type="edit" style={{cursor: 'pointer', marginLeft: 20}} title="Editar" onClick={() => this.loadProducaoModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeletePcp(record.key)}>
                            <a href="/admin/producao" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Button className="buttonBlue" onClick={() => this.goToAcompanharProducao()} style={{marginRight: 10}}><Icon type="eye" /> Visão Geral</Button>
                        <Tooltip title="Criar novo PCP" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadProducaoModal()}><Icon type="plus" /> Novo PCP</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de PCP"
                    visible={this.state.showProducaoModal}
                    onCancel={() => this.showProducaoModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showProducaoModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarProducaoLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                    width={900}
                >
                    <Row>
                        <Col span={24} id="colCadastroPCP" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Campo Nome obrigatório',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Informe o nome do PCP"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Data Inicial"
                                >
                                    {getFieldDecorator('dataInicial', {
                                        rules: [{ required: true, message: 'Campo Data Inicial obrigatório' }]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data inicial"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colCadastroPCP')}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label="Ativo">
                                    {getFieldDecorator('ativo', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione',
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder="Selecione"
                                            getPopupContainer={() => document.getElementById('colCadastroPCP')}
                                            allowClear={true}
                                        >
                                            {
                                                ativoOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                                <Divider />
                                <h4>Composição da Produção</h4>
                                {composicaoItems}
                                <Row>
                                    <Col span={24}>
                                        <Button key="primary" title="Incluir produto" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Modal>
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
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) },
        setProducaoMainData: (producao) => { dispatch({ type: 'SET_PRODUCAOMAINDATA', producao }) },
        resetProducaoMainData: () => { dispatch({ type: 'RESET_PRODUCAOMAINDATA' }) },
        
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Producao)))