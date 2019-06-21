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

class Insumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Insumos')
    }

    state = {
        insumosId: null,
        tableData: [],
        showInsumosModal: false,
        tableLoading: false,
        buttonSalvarInsumo: false,
        unidadeMedidasOptions: [],
        unidadeMedidasSelectStatus: {
            placeholder: 'Carregando...',
            disabled: false
        }
    }

    requestGetInsumos = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getInsumos')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(insumo => {
                    var ativo = insumo.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: insumo.id,
                        nome: insumo.nome,
                        ativoValue: insumo.ativo,
                        ativoDescription: ativo,
                        unidadeMedidasValue: insumo.idUnidadeMedidas,
                        unidadeMedidasDescription: insumo.nomeUnidadeMedidas
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

    requestCreateUpdateInsumo = (request) => {
        this.setState({buttonSalvarInsumo: true})
        axios.post(this.props.backEndPoint + '/createUpdateInsumo', request)
        .then(res => {
            this.showInsumosModal(false)
            this.requestGetInsumos()
            this.setState({buttonSalvarInsumo: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarInsumo: false})
        })
    }

    showInsumosModal = (showInsumosModal) => {
        // Se estiver fechando
        if(!showInsumosModal){
            this.props.form.resetFields()
            this.setState({insumosId: null})
        }
        this.setState({showInsumosModal})
    }

    loadInsumosModal = (record) => {
        this.loadUnidadesMedidasOptions()
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue,
                unidademedidas: record.unidadeMedidasDescription
            })

            this.setState({insumosId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showInsumosModal(true)
    }

    handleDeleteInsumo = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteInsumo?id='+id)
        .then(res => {
            this.requestGetInsumos()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.insumosId ? this.state.insumosId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo,
                    unidademedidas: values.unidademedidas,
                }
                this.requestCreateUpdateInsumo(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    loadUnidadesMedidasOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getUnidadesMedidas?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    unidadeMedidasOptions: res.data.payload.map(unidademedidas => {
                        return({
                            value: unidademedidas.id,
                            description: unidademedidas.nome
                        })
                    }),
                    unidadeMedidasSelectStatus: {
                        placeholder: 'Selecione a Unidade de Medidas',
                        disabled: false
                    }
                })
            }
            else
                console.log('Nenhum registro de unidade de medidas encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
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
        this.requestGetInsumos()
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
            title: 'Unidade de Medidas',
            dataIndex: 'unidadeMedidasDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.unidadeMedidasDescription, b.unidadeMedidasDescription)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadInsumosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteInsumo(record.key)}>
                            <a href="/admin/cadastros/insumos" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Insumo" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadInsumosModal()}><Icon type="plus" /> Novo Insumo</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Insumos"
                    visible={this.state.showInsumosModal}
                    onCancel={() => this.showInsumosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showInsumosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarInsumo} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeInsumos" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do insumo',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do insumo"
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
                                            getPopupContainer={() => document.getElementById('colCadastroDeInsumos')}
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
                                <Form.Item label="UnidadeMedidas">
                                    {getFieldDecorator('unidademedidas', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione a unidade de medidas',
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder={this.state.unidadeMedidasSelectStatus.placeholder}
                                            disabled={this.state.unidadeMedidasSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('colCadastroDeInsumos')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.unidadeMedidasOptions.map((option) => {
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Insumos))