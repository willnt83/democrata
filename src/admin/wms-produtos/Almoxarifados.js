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

class WMSProdAlmoxarifados extends Component {
    constructor(props) {
        super()
        props.setPageTitle('WMS Produtos - Almoxarifados')
    }

    state = {
        almoxarifadoId: null,
        tableData: [],
        showAlmoxarifadosModal: false,
        tableLoading: false,
        buttonSalvarAlmoxarifado: false
    }

    requestGetAlmoxarifados = () => {
        this.setState({tableLoading: true})
        axios.get(this.props.backEndPoint + '/wms-produtos/getAlmoxarifados')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(almoxarifado => {
                    var ativo = almoxarifado.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: almoxarifado.id,
                        nome: almoxarifado.nome,
                        ativo: ativo,
                        ativoValue: almoxarifado.ativo
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

    requestCreateUpdateAlmoxarifado = (request) => {
        this.setState({buttonSalvarAlmoxarifado: true})
        axios.post(this.props.backEndPoint + '/wms-produtos/createUpdateAlmoxarifado', request)
        .then(res => {
            this.showAlmoxarifadosModal(false)
            this.requestGetAlmoxarifados()
            this.setState({buttonSalvarAlmoxarifado: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarAlmoxarifado: false})
        })
    }

    showAlmoxarifadosModal = (showAlmoxarifadosModal) => {
        // Se estiver fechando
        if(!showAlmoxarifadosModal){
            this.props.form.resetFields()
            this.setState({almoxarifadoId: null})
        }
        this.setState({showAlmoxarifadosModal})
    }

    loadAlmoxarifadosModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue
            })

            this.setState({almoxarifadoId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showAlmoxarifadosModal(true)
    }

    handleDeleteAlmoxarifado = (id) => {
        this.setState({tableLoading: true})
        axios.get(this.props.backEndPoint + '/wms-produtos/deleteAlmoxarifado?id='+id)
        .then(res => {
            this.requestGetAlmoxarifados()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.almoxarifadoId ? this.state.almoxarifadoId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo
                }
                this.requestCreateUpdateAlmoxarifado(request)
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
        this.requestGetAlmoxarifados()
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadAlmoxarifadosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteAlmoxarifado(record.key)}>
                            <a href="/admin/cadastros/almoxarifados" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Almoxarifado" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadAlmoxarifadosModal()}><Icon type="plus" /> Novo Almoxarifado</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Almoxarifados"
                    visible={this.state.showAlmoxarifadosModal}
                    onCancel={() => this.showAlmoxarifadosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showAlmoxarifadosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarAlmoxarifado} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeAlmoxarifados" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do almoxarifado',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do almoxarifado"
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
                                            getPopupContainer={() => document.getElementById('colCadastroDeAlmoxarifados')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(WMSProdAlmoxarifados))