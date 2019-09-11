import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

import Upload from "../shared/upload/Upload";

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

const filesAccepted = [
    'text/csv'
]

const UploadEndPoint = 'importInsumos'

class Insumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Insumos')
    }

    state = {
        insumosId: null,
        tableData: [],
        showInsumosModal: false,
        showInsumosImportModal: false,
        tableLoading: false,
        buttonSalvarInsumo: false,
        unidadeOptions: [],
        unidadeMedidaOptions: [],
        unidadeSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        unidadeMedidaSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        dynamicFieldsRendered: false
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
                        ins: insumo.ins,
                        categoria: insumo.categoria,
                        ativoValue: insumo.ativo,
                        ativoDescription: ativo,
                        unidadeValue: insumo.idUnidade,
                        unidadeDescription: insumo.nomeUnidade,                        
                        unidadeMedidaValue: insumo.idUnidadeMedida,
                        unidadeMedidaDescription: insumo.nomeUnidadeMedida+' ('+insumo.unidadeUnidadeMedida+')'
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

    loadUnidadesOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getUnidades?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    unidadeOptions: res.data.payload.map(unidade => {
                        return({
                            value: unidade.id,
                            description: unidade.nome
                        })
                    }),
                    unidadeSelectStatus: {
                        placeholder: 'Selecione a Unidade',
                        disabled: false
                    }
                })
            }
            else
                console.log('Nenhum registro de unidade encontrada')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadUnidadesMedidaOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getUnidadesMedida?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    unidadeMedidaOptions: res.data.payload.map(unidademedida => {
                        return({
                            value: unidademedida.id,
                            description: unidademedida.nome+' ('+unidademedida.unidade+')'
                        })
                    }),
                    unidadeMedidaSelectStatus: {
                        placeholder: 'Selecione a Unidade de Medida',
                        disabled: false
                    }
                })
            }
            else
                console.log('Nenhum registro de unidade de medida encontrada')
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

    showInsumosImportModal = (showInsumosImportModal) => {
        this.setState({showInsumosImportModal})
    }

    loadInsumosModal = (record) => {
        this.loadUnidadesOptions()
        this.loadUnidadesMedidaOptions()
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ins: record.ins,
                ativo: record.ativoValue,
                categoria: record.categoria,
                unidade: record.unidadeValue,
                unidademedida: record.unidadeMedidaValue
            })

            this.setState({
                insumosId: record.key,
                dynamicFieldsRendered: true
            })
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showInsumosModal(true)
    }

    goToImportInsumos = () => {
        this.showInsumosImportModal(true)
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){
            this.setState({dynamicFieldsRendered: false})
        }
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
                var id = this.state.insumosId ? this.state.insumosId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    ins: values.ins,
                    ativo: values.ativo,
                    categoria: values.categoria,
                    unidade: values.unidade,
                    unidademedida: values.unidademedida,
                }
                this.requestCreateUpdateInsumo(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
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
            title: 'INS',
            dataIndex: 'ins',
            sorter: (a, b) => this.compareByAlph(a.ins, b.ins)
        }, {
            title: 'Categoria',
            dataIndex: 'categoria',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        }, {
            title: 'Unidade de Medida',
            dataIndex: 'unidadeMedidaDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.unidadeMedidaDescription, b.unidadeMedidaDescription)
        }, {
            title: 'Unidade',
            dataIndex: 'unidadeDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.unidadeDescription, b.unidadeDescription)
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
                    <Col span={12} style={{ textAlign: 'left' }}>
                        <Tooltip title="Improtar CSV" placement="right">
                            <Button onClick={() => this.goToImportInsumos()}><Icon type="file-excel" /> Importar CSV</Button>
                        </Tooltip>
                    </Col>                    
                    <Col span={12} style={{ textAlign: 'right' }}>
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
                    title="Importação de Insumos"
                    visible={this.state.showInsumosImportModal}
                    onCancel={() => this.showInsumosImportModal(false)}
                    footer={null}
                    width={700}
                    afterClose={() => this.requestGetInsumos()}
                >
                    <Upload UploadEndPoint={UploadEndPoint} filesAccepted={filesAccepted} />
                </Modal>                
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
                                <Form.Item
                                    label="INS"
                                >
                                    {getFieldDecorator('ins', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a INS do insumo',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="ins"
                                            maxLength={25}
                                            placeholder="Digite a INS do insumo"
                                        />
                                    )}
                                </Form.Item>                                
                                <Form.Item
                                    label="Categoria"
                                >
                                    {getFieldDecorator('categoria', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a categoria do insumo',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="categoria"
                                            placeholder="Digite a categoria do insumo"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label="Unidade">
                                    {getFieldDecorator('unidade', {})(
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder={this.state.unidadeSelectStatus.placeholder}
                                            disabled={this.state.unidadeSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('colCadastroDeInsumos')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.unidadeOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>                                
                                <Form.Item label="Unidade de Medida">
                                    {getFieldDecorator('unidademedida', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione a unidade de medida',
                                            }
                                        ]
                                    })(
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder={this.state.unidadeMedidaSelectStatus.placeholder}
                                            disabled={this.state.unidadeMedidaSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('colCadastroDeInsumos')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.unidadeMedidaOptions.map((option) => {
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
                                            showSearch
                                            optionFilterProp="children"
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