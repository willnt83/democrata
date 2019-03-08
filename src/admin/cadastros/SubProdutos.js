import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class Subprodutos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Subprodutos')
    }

    state = {
        subprodutoId: null,
        tableData: [],
        showSubprodutosModal: false,
        tableLoading: false,
        buttonSalvarSubproduto: false
    }

    requestGetSubprodutos = () => {
        this.setState({tableLoading: true})
        axios
        .get('http://testedemocrata.tk/getSubprodutos')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(subproduto => {
                    var ativo = subproduto.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: subproduto.id,
                        nome: subproduto.nome,
                        ativo: ativo,
                        ativoValue: subproduto.ativo
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
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    requestCreateUpdateSubproduto = (request) => {
        this.setState({buttonSalvarSubproduto: true})
        axios.post('http://testedemocrata.tk/createUpdateSubproduto', request)
        .then(res => {
            this.showSubprodutosModal(false)
            this.requestGetSubprodutos()
            this.setState({buttonSalvarSubproduto: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarSubproduto: false})
        })
    }

    showSubprodutosModal = (showSubprodutosModal) => {
        // Se estiver fechando
        if(!showSubprodutosModal){
            this.props.form.resetFields()
            this.setState({subprodutoId: null})
        }
        this.setState({showSubprodutosModal})
    }

    loadSubprodutosModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue
            })

            this.setState({subprodutoId: record.key})
        }
        this.showSubprodutosModal(true)
    }

    handleDeleteSubproduto = (id) => {
        this.setState({tableLoading: true})
        axios
        .get('http://testedemocrata.tk/deleteSubproduto?id='+id)
        .then(res => {
            this.requestGetSubprodutos()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.subprodutoId ? this.state.subprodutoId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo
                }
                this.requestCreateUpdateSubproduto(request)
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

    componentWillMount(){
        this.requestGetSubprodutos()
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        }, {
            title: 'Descrição',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        }, {
            title: 'Ativo',
            dataIndex: 'ativo',
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
            onFilter: (value, record) => record.ativo.indexOf(value) === 0
        }, {
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadSubprodutosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteSubproduto(record.key)}>
                            <a href="/admin/cadastros/subprodutos" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Subproduto" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadSubprodutosModal()}><Icon type="plus" /> Novo Subproduto</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Subprodutos"
                    visible={this.state.showSubprodutosModal}
                    onCancel={() => this.showSubprodutosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showSubprodutosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarSubproduto} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item
                            label="Nome"
                        >
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome do subproduto',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome do subproduto"
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
                                >
                                    {
                                        ativoOptions.map((option) => {
                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
          </Content>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(null, mapDispatchToProps)(Form.create()(Subprodutos))