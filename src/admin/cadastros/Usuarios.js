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

class Usuarios extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Usuários')
    }

    state = {
        usuarioId: null,
        tableData: [],
        showUsuariosModal: false,
        tableLoading: false,
        buttonSalvarUsuario: false
    }

    requestGetUsuarios = () => {
        this.setState({tableLoading: true})
        axios
        .get('http://localhost/getUsuarios')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(usuario => {
                    var ativo = usuario.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: usuario.id,
                        nome: usuario.nome,
                        ativo: ativo,
                        ativoValue: usuario.ativo
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

    requestCreateUpdateUsuario = (request) => {
        this.setState({buttonSalvarUsuario: true})
        axios.post('http://localhost/createUpdateUsuario', request)
        .then(res => {
            this.showUsuariosModal(false)
            this.requestGetUsuarios()
            this.setState({buttonSalvarUsuario: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUsuario: false})
        })
    }

    showUsuariosModal = (showUsuariosModal) => {
        // Se estiver fechando
        if(!showUsuariosModal){
            this.props.form.resetFields()
            this.setState({usuarioId: null})
        }
        this.setState({showUsuariosModal})
    }

    loadUsuariosModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue
            })
            this.setState({usuarioId: record.key})
        }
        this.showUsuariosModal(true)
    }

    handleDeleteUsuario = (id) => {
        this.setState({tableLoading: true})
        axios
        .get('http://localhost/deleteUsuario?id='+id)
        .then(res => {
            this.requestGetUsuarios()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.usuarioId ? this.state.usuarioId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo
                }
                this.requestCreateUpdateUsuario(request)
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
        this.requestGetUsuarios()
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadUsuariosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteUsuario(record.key)}>
                            <a href="/admin/cadastros/usuarios" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Usuário" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadUsuariosModal()}><Icon type="plus" /> Novo Usuário</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Usuarios"
                    visible={this.state.showUsuariosModal}
                    onCancel={() => this.showUsuariosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showUsuariosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarUsuario} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item
                            label="Nome"
                        >
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome do usuário',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome do usuário"
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

export default connect(null, mapDispatchToProps)(Form.create()(Usuarios))