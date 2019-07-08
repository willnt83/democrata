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

class Fornecedores extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Fornecedores')
    }

    state = {
        fornecedoresId: null,
        tableData: [],
        showFornecedoresModal: false,
        tableLoading: false,
        buttonSalvarFornecedor: false
    }

    requestGetFornecedores = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getFornecedores')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(fornecedor => {
                    var ativo = fornecedor.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: fornecedor.id,
                        nome: fornecedor.nome,
                        ativoValue: fornecedor.ativo,
                        ativoDescription: ativo,
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

    requestCreateUpdateFornecedor = (request) => {
        this.setState({buttonSalvarFornecedor: true})
        axios.post(this.props.backEndPoint + '/createUpdateFornecedor', request)
        .then(res => {
            this.showFornecedoresModal(false)
            this.requestGetFornecedores()
            this.setState({buttonSalvarFornecedor: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarFornecedor: false})
        })
    }

    showFornecedoresModal = (showFornecedoresModal) => {
        // Se estiver fechando
        if(!showFornecedoresModal){
            this.props.form.resetFields()
            this.setState({fornecedoresId: null})
        }
        this.setState({showFornecedoresModal})
    }

    loadFornecedoresModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue
            })

            this.setState({fornecedoresId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showFornecedoresModal(true)
    }

    handleDeleteFornecedor = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteFornecedor?id='+id)
        .then(res => {
            this.requestGetFornecedores()
        })
        .catch(error => {
            console.log(error)
        })
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.fornecedoresId ? this.state.fornecedoresId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo
                }
                this.requestCreateUpdateFornecedor(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    componentWillMount(){
        this.requestGetFornecedores()
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadFornecedoresModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteFornecedor(record.key)}>
                            <a href="/admin/cadastros/fornecedores" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Fornecedor" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadFornecedoresModal()}><Icon type="plus" /> Novo Fornecedor</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Fornecedores"
                    visible={this.state.showFornecedoresModal}
                    onCancel={() => this.showFornecedoresModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showFornecedoresModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarFornecedor} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeFornecedores" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do fornecedor',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do fornecedor"
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
                                            getPopupContainer={() => document.getElementById('colCadastroDeFornecedores')}
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
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Fornecedores))