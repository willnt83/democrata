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

class PosicaoArmazem extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Posição do Armazém')
    }

    state = {
        posicaoAramazemId: null,
        tableData: [],
        showPosicaoArmazemModal: false,
        tableLoading: false,
        buttonSalvarPosicaoArmazem: false,
        almoxarifadoOptions: [],
        almoxarifadoSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        dynamicFieldsRendered: false
    }

    requestGetPosicaoArmazem = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getPosicaoArmazens')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(posicaoarmazem => {
                    var ativo = posicaoarmazem.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: posicaoarmazem.id,
                        posicao: posicaoarmazem.posicao,
                        ativoValue: posicaoarmazem.ativo,
                        ativoDescription: ativo,
                        almoxarifadoValue: posicaoarmazem.idAlmoxarifado,
                        almoxarifadoDescription: posicaoarmazem.nomeAlmoxarifado
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

    loadAlmoxarifadosOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getAlmoxarifados?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    almoxarifadoOptions: res.data.payload.map(almoxarifado => {
                        return({
                            value: almoxarifado.id,
                            description: almoxarifado.nome
                        })
                    }),
                    almoxarifadoSelectStatus: {
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

    requestCreateUpdatePosicaoArmazem = (request) => {
        this.setState({buttonSalvarPosicaoArmazem: true})
        axios.post(this.props.backEndPoint + '/createUpdatePosicaoArmazem', request)
        .then(res => {
            this.showPosicaoArmazemModal(false)
            this.requestGetPosicaoArmazem()
            this.setState({buttonSalvarPosicaoArmazem: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarPosicaoArmazem: false})
        })
    }

    showPosicaoArmazemModal = (showPosicaoArmazemModal) => {
        // Se estiver fechando
        if(!showPosicaoArmazemModal){
            this.props.form.resetFields()
            this.setState({posicaoAramazemId: null})
        }
        this.setState({showPosicaoArmazemModal})
    }

    loadPosicaoArmazemModal = (record) => {
        this.loadAlmoxarifadosOptions()
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                posicao: record.posicao,
                ativo: record.ativoValue,
                almoxarifado: record.almoxarifadoValue
            })

            this.setState({
                posicaoAramazemId: record.key,
                dynamicFieldsRendered: true
            })
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showPosicaoArmazemModal(true)
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){
            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleDeletePosicaoArmazem = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deletePosicaoArmazem?id='+id)
        .then(res => {
            this.requestGetPosicaoArmazem()
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
                var id = this.state.posicaoAramazemId ? this.state.posicaoAramazemId : null
                var request = {
                    id: id,
                    posicao: values.posicao,
                    ativo: values.ativo,
                    almoxarifado: values.almoxarifado
                }
                this.requestCreateUpdatePosicaoArmazem(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    componentWillMount(){
        this.requestGetPosicaoArmazem()
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        }, {
            title: 'Posição',
            dataIndex: 'posicao',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        }, {
            title: 'Almoxarifado',
            dataIndex: 'almoxarifadoDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.almoxarifadoDescription, b.almoxarifadoDescription)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadPosicaoArmazemModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeletePosicaoArmazem(record.key)}>
                            <a href="/admin/cadastros/posicaoarmazem" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Nova Posição do Armazém Virtual" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadPosicaoArmazemModal()}><Icon type="plus" /> Nova Posição do Armazém Virtual</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Posição do Armazém Virtual"
                    visible={this.state.showPosicaoArmazemModal}
                    onCancel={() => this.showPosicaoArmazemModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showPosicaoArmazemModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarPosicaoArmazem} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDePosicaoArmazem" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Posição"
                                >
                                    {getFieldDecorator('posicao', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a posição do armazém',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="posicao"
                                            placeholder="Digite a posição do armazém"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label="Almoxarifado">
                                    {getFieldDecorator('almoxarifado', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione o almoxarifado',
                                            }
                                        ]
                                    })(
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder={this.state.almoxarifadoSelectStatus.placeholder}
                                            disabled={this.state.almoxarifadoSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('colCadastroDePosicaoArmazem')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.almoxarifadoOptions.map((option) => {
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
                                            getPopupContainer={() => document.getElementById('colCadastroDePosicaoArmazem')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(PosicaoArmazem))