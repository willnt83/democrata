import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, notification } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from 'axios'

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
        buttonSalvarUsuario: false,
        perfisOptions: [],
        perfisSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        }
    }

    requestGetUsuarios = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getUsuarios')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(usuario => {
                    var ativo = usuario.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        perfil: usuario.perfil,
                        ativoValue: usuario.ativo,
                        ativoDescription: ativo
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
        axios.post(this.props.backEndPoint + '/createUpdateUsuario', request)
        .then(res => {
            if(res.data.success){
                this.showUsuariosModal(false)
                this.requestGetUsuarios()
                this.showNotification(res.data.msg, true)
            }
            else{
                this.showNotification(res.data.msg, false)
            }
            this.setState({buttonSalvarUsuario: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUsuario: false})
        })
    }

    loadPerfisOptions = () => {
        axios
        .get(this.props.backEndPoint + '/getPerfis?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    perfisOptions: res.data.payload.map(perfil => {
                        return(
                            {value: perfil.id, description: perfil.nome}
                        )
                    }),
                    perfisSelectStatus: {
                        placeholder: 'Selecione',
                        disabled: false
                    }
                })
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

    showUsuariosModal = (showUsuariosModal) => {
        // Se estiver fechando
        if(!showUsuariosModal){
            this.props.form.resetFields()
            this.setState({usuarioId: null})
        }
        this.setState({showUsuariosModal})
    }

    loadUsuariosModal = (record) => {
        this.loadPerfisOptions()
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                email: record.email,
                perfil: record.perfil.id,
                ativo: record.ativoValue
            })
            this.setState({usuarioId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showUsuariosModal(true)
    }

    handleDeleteUsuario = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteUsuario?id='+id)
        .then(res => {
            if(res.data.success){
                this.showNotification(res.data.msg, true)
                this.requestGetUsuarios()
            }
            else{
                this.showNotification(res.data.msg, false)
            }
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
                    email: values.email,
                    senha: values.senha,
                    idPerfil: values.perfil,
                    ativo: values.ativo
                }
                this.requestCreateUpdateUsuario(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
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
            duration: 0
        }
        notification.open(args)
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('senha')) {
            callback('As senhas informadas são diferentes');
        }
        else {
            callback();
        }
    }
    
    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirmacaoSenha'], { force: true });
        }
        callback();
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
        },
        {
            title: 'Nome',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.nome, b.nome)
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            sorter: (a, b) => this.compareByAlph(a.email, b.email)
        },
        {
            title: 'Perfil',
            dataIndex: 'perfil.nome',
            sorter: (a, b) => this.compareByAlph(a.perfil.nome, b.perfil.nome)
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
                    <Row>
                        <Col span={24} id="colCadastroDeUsuarios" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do usuário"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="E-mail"
                                >
                                    {getFieldDecorator('email', {
                                        rules: [
                                            {
                                                type: 'email', message: 'Endereço de e-mail inválido',
                                            },
                                            {
                                                required: true, message: 'Por favor informe o endereço e-mail',
                                            }
                                        ],
                                    })(
                                        <Input
                                            id="email"
                                            placeholder="Digite o endereço de e-mail do usuário"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Senha"
                                >
                                    {getFieldDecorator('senha', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a senha',
                                            },
                                            {
                                                validator: this.validateToNextPassword,
                                            }
                                        ],
                                    })(
                                        <Input
                                            id="senha"
                                            type="password"
                                            placeholder="Digite a senha"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Confirmação de Senha"
                                >
                                    {getFieldDecorator('confirmacaoSenha', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor confirme a senha',
                                            },
                                            {
                                                validator: this.compareToFirstPassword,
                                            }
                                        ],
                                    })(
                                        <Input
                                            id="senhaConfirmacao"
                                            type="password"
                                            placeholder="Confirme a senha"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label="Perfil do Usuário">
                                    {getFieldDecorator('perfil', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione o perfil',
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder={this.state.perfisSelectStatus.placeholder}
                                            disabled={this.state.perfisSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('colCadastroDeUsuarios')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.perfisOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
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
                                            getPopupContainer={() => document.getElementById('colCadastroDeUsuarios')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Usuarios))