import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, notification } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class Funcionarios extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Funcionarios')
    }

    state = {
        funcionarioId: null,
        tableData: [],
        showFuncionariosModal: false,
        tableLoading: false,
        buttonSalvarFuncionario: false,
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
            duration: 3
        }
        notification.open(args)
    }

    requestGetFuncionarios = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getFuncionarios')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(funcionario => {
                    var ativo = funcionario.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: funcionario.id,
                        nome: funcionario.nome,
                        matricula: funcionario.matricula,
                        salario: funcionario.salario,
                        salarioBase: funcionario.salarioBase,
                        setor: funcionario.setor,
                        ativo: ativo,
                        ativoValue: funcionario.ativo
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

    requestCreateUpdateFuncionario = (request) => {
        this.setState({buttonSalvarFuncionario: true})
        axios.post(this.props.backEndPoint + '/createUpdateFuncionario', request)
        .then(res => {
            this.showFuncionariosModal(false)
            this.requestGetFuncionarios()
            this.setState({buttonSalvarFuncionario: false})
            this.showNotification(res.data.msg, res.data.success)
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUnidade: false})
        })
    }

    showFuncionariosModal = (showFuncionariosModal) => {
        // Se estiver fechando
        if(!showFuncionariosModal){
            this.props.form.resetFields()
            this.setState({funcionarioId: null})
        }

        this.setState({showFuncionariosModal})
    }

    loadFuncionariosModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                matricula: record.matricula,
                salario: record.salario,
                salarioBase: record.salarioBase,
                setor: record.setor,
                ativo: record.ativoValue
            })
            this.setState({funcionarioId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showFuncionariosModal(true)
    }

    handleDeleteFuncionario = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteFuncionario?id='+id)
        .then(res => {
            this.requestGetFuncionarios()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.funcionarioId ? this.state.funcionarioId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    matricula: values.matricula,
                    salario: values.salario,
                    salarioBase: values.salarioBase,
                    setor: values.setor,
                    ativo: values.ativo
                }
                this.requestCreateUpdateFuncionario(request)
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
        this.requestGetFuncionarios()
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
            title: 'Matrícula',
            dataIndex: 'matricula',
            sorter: (a, b) => this.compareByAlph(a.matricula, b.matricula)
        },
        {
            title: 'Salário',
            dataIndex: 'salario',
            sorter: (a, b) => this.compareByAlph(a.salario, b.salario)
        },
        {
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadFuncionariosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteFuncionario(record.key)}>
                            <a href="/admin/cadastros/funcionarios" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar um novo funcionário?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadFuncionariosModal()}><Icon type="plus" /> Novo Funcionário</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Funcionários"
                    visible={this.state.showFuncionariosModal}
                    onCancel={() => this.showFuncionariosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showFuncionariosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarFuncionario} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                    maskClosable={false}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeFuncionarios" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do funcionário',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do funcionário"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Matrícula"
                                >
                                    {getFieldDecorator('matricula')(
                                        <Input
                                            id="matricula"
                                            placeholder="Digite o código de matrícula do funcionário"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Salário"
                                >
                                    {getFieldDecorator('salario', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o valor salarial',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="salario"
                                            placeholder="Informe o valor salarial"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Salário Base"
                                >
                                    {getFieldDecorator('salarioBase', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o salário base',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="salario"
                                            placeholder="Informe o salário base"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Setor"
                                >
                                    {getFieldDecorator('setor', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o setor',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="salario"
                                            placeholder="Informe o setor"
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
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder="Selecione"
                                            getPopupContainer={() => document.getElementById('colCadastroDeFuncionarios')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Funcionarios))