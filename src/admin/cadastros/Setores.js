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

class Setores extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Setores')
    }

    state = {
        setorId: null,
        tableData: [],
        showSetoresModal: false,
        tableLoading: false,
        buttonSalvarSetor: false,
    }

    requestGetSetores = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getSetores')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(setor => {
                    var ativo = setor.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: setor.id,
                        nome: setor.nome,
                        ativo: ativo,
                        ativoValue: setor.ativo
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

    requestCreateUpdateSetor = (request) => {
        this.setState({buttonSalvarSetor: true})
        axios.post(this.props.backEndPoint + '/createUpdateSetor', request)
        .then(res => {
            this.showSetoresModal(false)
            this.requestGetSetores()
            this.setState({buttonSalvarSetor: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarUnidade: false})
        })
    }

    showSetoresModal = (showSetoresModal) => {
        // Se estiver fechando
        if(!showSetoresModal){
            this.props.form.resetFields()
            this.setState({setorId: null})
        }

        this.setState({showSetoresModal})
    }

    loadSetoresModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue
            })
            this.setState({setorId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showSetoresModal(true)
    }

    handleDeleteSetor = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteSetor?id='+id)
        .then(res => {
            this.requestGetSetores()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.setorId ? this.state.setorId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo
                }
                this.requestCreateUpdateSetor(request)
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
        this.requestGetSetores()
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadSetoresModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteSetor(record.key)}>
                            <a href="/admin/cadastros/setores" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar um novo setor?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadSetoresModal()}><Icon type="plus" /> Novo Setor</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Setores"
                    visible={this.state.showSetoresModal}
                    onCancel={() => this.showSetoresModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showSetoresModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarSetor} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeSetores" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do setor',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do setor"
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
                                            getPopupContainer={() => document.getElementById('colCadastroDeSetores')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Setores))