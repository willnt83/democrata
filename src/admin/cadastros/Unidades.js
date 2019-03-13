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

class Unidades extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Unidades')
    }

    state = {
        unidadeId: null,
        tableData: [],
        showUnidadesModal: false,
        tableLoading: false,
        buttonSalvarUnidade: false
    }

    requestGetUnidades = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getUnidades')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(unidade => {
                    var ativo = unidade.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: unidade.id,
                        nome: unidade.nome,
                        ativo: ativo,
                        ativoValue: unidade.ativo
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

    requestCreateUpdateUnidade = (request) => {
        this.setState({buttonSalvarUnidade: true})
        axios.post(this.props.backEndPoint + '/createUpdateUnidade', request)
        .then(res => {
            this.showUnidadesModal(false)
            this.requestGetUnidades()
            this.setState({buttonSalvarUnidade: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUnidade: false})
        })
    }

    showUnidadesModal = (showUnidadesModal) => {
        // Se estiver fechando
        if(!showUnidadesModal){
            this.props.form.resetFields()
            this.setState({unidadeId: null})
        }
        this.setState({showUnidadesModal})
    }

    loadUnidadesModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue
            })
            this.setState({unidadeId: record.key})
        }
        this.showUnidadesModal(true)
    }

    handleDeleteUnidade = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteUnidade?id='+id)
        .then(res => {
            console.log('deleteUnidade response', res)
            this.requestGetUnidades()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.unidadeId ? this.state.unidadeId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo
                }
                this.requestCreateUpdateUnidade(request)
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
        this.requestGetUnidades()
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadUnidadesModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteUnidade(record.key)}>
                            <a href="/admin/cadastros/unidades" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Nova Unidade" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadUnidadesModal()}><Icon type="plus" /> Nova Unidade</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Unidades"
                    visible={this.state.showUnidadesModal}
                    onCancel={() => this.showUnidadesModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showUnidadesModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarUnidade} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item
                            label="Nome"
                        >
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome da unidade',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome da unidade"
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Unidades))