import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Notification,Button, Row, Col, Form,DatePicker, Select } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import axios from "axios"
import 'moment/locale/pt-br'
moment.locale('pt-br')

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class CapacidadeProdutiva extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Capacidade Produtiva')
    }

    state = {
        corId: null,
        tableData: [],
        showCoresModal: false,
        tableLoading: false,
        buttonSalvarCapacidadeProdutiva: false
    }

    requestGetCapacidadeProdutiva = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getCapacidadeProdutiva')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(capacidadeProdutiva => {
                    return({
                        key: capacidadeProdutiva.id,
                        id_linha: capacidadeProdutiva.id_linha,
                        linha: capacidadeProdutiva.linha,
                        data: capacidadeProdutiva.data,
                        capacidade: capacidadeProdutiva.capacidade
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

    requestCreateUpdateCapacidadeProdutiva = (request) => {
        this.setState({buttonSalvarCor: true})
        axios.post(this.props.backEndPoint + '/createUpdateCapacidadeProdutiva', request)
        .then(res => {
            this.showCapacidadeProdutivaModal(false)
            this.requestGetCapacidadePordutiva()
            this.setState({buttonSalvarCapacidadeProdutiva: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarCapacidadeProdutiva: false})
        })
    }

    showCapacidadeProdutivaModal = (showCapacidadeProdutivaModal) => {
        // Se estiver fechando
        if(!showCapacidadeProdutivaModal){
            this.props.form.resetFields()
            this.setState({corId: null})
        }
        this.setState({showCapacidadeProdutivaModal})
    }

    loadCapacidadeProdutivaModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                id_linha: record.id_linha,
                data: record.data,
                capacidade: record.capacidade
            })
            this.setState({capacidadeProdutivaId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                //ativo: 'Y'
            })
        }
        this.showCapacidadeProdutivaModal(true)
    }

    handleDeleteCapacidadeProdutiva = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteCapacidadeProdutiva?id='+id)
        .then(res => {
            this.requestGetCapacidadeProdutiva()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.capacidadeProdutivaId ? this.state.capacidadeProdutivaId : null
                var request = {
                    id: id,
                    id_linha: values.id_linha,
                    data: values.data,
                    capacidade: values.capacidade
                }
                this.requestCreateUpdateCapacidadeProdutiva(request)
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
        this.requestGetCapacidadeProdutiva()
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        }, {
            title: 'Linha',
            dataIndex: 'linha',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        },{
            title: 'Data',
            dataIndex: 'data',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        },
        /*{
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
        }, */{
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadCapacidadeProdutivaModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteCapacidadeProdutiva(record.key)}>
                            <a href="/admin/pcp/cores" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Capacidade Produtiva" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadCapacidadeProdutivaModal()}><Icon type="plus" /> CapacidadeProdutiva</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />

                {///MODAL UPDATE E CREATE CAPACIDADE PRODUTIVA
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                }

                <Modal
                    title="Cadastro de Capacidade Produtiva"
                    visible={this.state.showCapacidadeProdutivaModal}
                    onCancel={() => this.showCapacidadeProdutivaModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showCapacidadeProdutivaModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarCapacidadeProdutiva} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeCapacidadeProdutiva" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item label="ID LINHA">
                                    {getFieldDecorator('id_linha', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o id da linha',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="id_linha"
                                            placeholder="Digite o nome id da linha"
                                        />
                                    )}
                                </Form.Item>
                                
                                <Row>
                                    <Col span={24} id="colFiltroData" style={{position: 'relative'}}>
                                    <Form layout="vertical">
                                <Form.Item
                                label="Data">
                                {getFieldDecorator('data', {
                                    rules: [{ required: true, message: 'Campo Dat obrigatório' }]
                                })(
                                    <DatePicker
                                        locale={ptBr}
                                        format="DD/MM/YYYY"
                                        placeholder="Selecione a data"
                                        style={ {width: '100%'} }
                                        getCalendarContainer={() => document.getElementById('colFiltroData')}
                                    />
                                )}
                            </Form.Item>

                                <Form.Item label="capacidadeProdutiva">
                                    {getFieldDecorator('capacidade', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o capacidade produtiva',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="capacidade"
                                            placeholder="Digite a capacidade produtiva"
                                        />
                                    )}
                                </Form.Item>
                                </Form>
                    </Col>
                </Row>
                               
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(CapacidadeProdutiva))