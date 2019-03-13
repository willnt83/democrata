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

const nivelAcessoOptions = [
    {value: 'Y', description: 'Administração'},
    {value: 'N', description: 'Produção'}
]

class PerfisDeAcesso extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Perfis de Acesso')
    }

    state = {
        perfilId: null,
        tableData: [],
        showPerfisModal: false,
        tableLoading: false,
        buttonSalvarPerfil: false,
        administrativo: 'Y',
        setoresOptions: [],
        setoresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        idSetor: null,
        setorFieldRedered: false
    }

    requestGetPerfis = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getPerfis')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(perfil => {
                    var ativo = perfil.ativo === 'Y' ? 'Sim' : 'Não'
                    var administrativo = perfil.administrativo === 'Y' ? 'Administração' : 'Produção'
                    return({
                        key: perfil.id,
                        nome: perfil.nome,
                        administrativoValue: perfil.administrativo,
                        administrativoDescription: administrativo,
                        setor: perfil.setor,
                        ativoValue: perfil.ativo,
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

    requestCreateUpdatePerfil = (request) => {
        this.setState({buttonSalvarPerfil: true})
        axios.post(this.props.backEndPoint + '/createUpdatePerfil', request)
        .then(res => {
            this.showPerfisModal(false)
            this.requestGetPerfis()
            this.setState({buttonSalvarPerfil: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUnidade: false})
        })
    }

    loadSetoresOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getSetores?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    setoresOptions: res.data.payload.map(setor => {
                        return({
                            value: setor.id,
                            description: setor.nome
                        })
                    }),
                    setoresSelectStatus: {
                        placeholder: 'Selecione o setor',
                        disabled: false
                    }
                })
            }
            else
                console.log('Nenhum registro de setor encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    showPerfisModal = (showPerfisModal) => {
        // Se estiver fechando
        if(!showPerfisModal){
            this.props.form.resetFields()
            this.setState({perfilId: null, administrativo: null})
        }

        this.setState({showPerfisModal})
    }

    loadPerfisModal = (record) => {
        this.loadSetoresOptions()
        console.log('loadPerfisModal', record)
        if(typeof(record) !== "undefined") {
            // Edit
            if(record.administrativoValue === 'N'){
                this.setState({administrativo: 'N', setorFieldRedered: true, idSetor: record.setor.id})
            }

            this.props.form.setFieldsValue({
                nome: record.nome,
                administrativo: record.administrativoValue,
                setor: record.setor.id,
                ativo: record.ativoValue
            })
            this.setState({perfilId: record.key})
        }
        this.showPerfisModal(true)
    }

    handleAdministrativoChange = (value) => {
        this.setState({administrativo: value})
    }

    handleDeletePerfil = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deletePerfil?id='+id)
        .then(res => {
            console.log('deleteUnidade response', res)
            this.requestGetPerfis()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.perfilId ? this.state.perfilId : null
                var setor = values.setor ? values.setor : null
                var request = {
                    id: id,
                    nome: values.nome,
                    administrativo: values.administrativo,
                    idSetor: setor,
                    ativo: values.ativo
                }
                this.requestCreateUpdatePerfil(request)
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
        this.requestGetPerfis()
    }

    componentWillUpdate(){
        if(this.state.setorFieldRedered){
            this.props.form.setFieldsValue({setor: this.state.idSetor})
            this.setState({setorFieldRedered: false})
        }


    }

    render(){
        const { getFieldDecorator } = this.props.form
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
            title: 'Perfil de Acesso',
            dataIndex: 'administrativoDescription',
            sorter: (a, b) => this.compareByAlph(a.administrativoDescription, b.administrativoDescription)
        },
        {
            title: 'Setor',
            dataIndex: 'setor.nome',
            sorter: (a, b) => this.compareByAlph(a.setor.nome, b.setor.nome)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadPerfisModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeletePerfil(record.key)}>
                            <a href="/admin/cadastros/perfis-de-acesso" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                )
            }
        }]

        var setorField = null
        if(this.state.administrativo === 'N'){
            setorField = 
                <Form.Item label="Setor">
                    {this.props.form.getFieldDecorator('setor', {
                        rules: [
                            {
                                required: true, message: 'Por favor selecione',
                            }
                        ]
                    })(
                        <Select
                            style={{ width: '100%' }}
                            placeholder={this.state.setoresSelectStatus.placeholder}
                            disabled={this.state.setoresSelectStatus.disabled}
                            onChange={this.handleSetorChange}
                        >
                            {
                                this.state.setoresOptions.map((option) => {
                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                })
                            }
                        </Select>
                    )}
                </Form.Item>
        }
        else
            setorField = null

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
                        <Tooltip title="Cadastrar um novo perfil?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadPerfisModal()}><Icon type="plus" /> Novo Perfil</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Perfis de Acesso"
                    visible={this.state.showPerfisModal}
                    onCancel={() => this.showPerfisModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showPerfisModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarPerfil} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item
                            label="Nome"
                        >
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome do perfil',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome do perfil"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="Nível de Acesso">
                            {getFieldDecorator('administrativo', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor selecione',
                                    }
                                ]
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Selecione"
                                    onChange={this.handleAdministrativoChange}
                                >
                                    {
                                        nivelAcessoOptions.map((option) => {
                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        {setorField}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(PerfisDeAcesso))