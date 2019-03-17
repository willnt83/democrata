import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, DatePicker, notification } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class DiasNaoUteis extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Dias não Úteis')
    }

    state = {
        diaNaoUtilId: null,
        tableData: [],
        showDiasNaoUteisModal: false,
        tableLoading: false,
        buttonSalvarDiaNaoUtil: false
    }

    requestGetDiasNaoUteis = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getDiasNaoUteis?data='+moment().format('YYYY-MM-DD'))
        .then(res => {
            if(res.data.success){
                var tableData = res.data.payload.map(diaNaoUtil => {
                    var ativo = diaNaoUtil.ativo === 'Y' ? 'Sim' : 'Não'
                    var dataObj = moment(diaNaoUtil.data, 'YYYY-MM-DD')
                    return({
                        key: diaNaoUtil.id,
                        nomeMes: dataObj.format('MMMM'),
                        dataValue: dataObj,
                        dataDescription: dataObj.format('DD/MM/YYYY'),
                        nome: diaNaoUtil.nome,
                        ativo: ativo,
                        ativoValue: diaNaoUtil.ativo
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

    requestCreateUpdateDiaNaoUtil = (request) => {
        this.setState({buttonSalvarDiaNaoUtil: true})
        axios.post(this.props.backEndPoint + '/createUpdateDiaNaoUtil', request)
        .then(res => {
            if(res.data.success){
                this.showDiasNaoUteisModal(false)
                this.requestGetDiasNaoUteis()
            }

            this.showNotification(res.data.msg, res.data.success)
            this.setState({buttonSalvarDiaNaoUtil: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarDiaNaoUtil: false})
        })
    }

    showDiasNaoUteisModal = (showDiasNaoUteisModal) => {
        // Se estiver fechando
        if(!showDiasNaoUteisModal){
            this.props.form.resetFields()
            this.setState({diaNaoUtilId: null})
        }
        this.setState({showDiasNaoUteisModal})
    }

    loadDiasNaoUteisModal = (record) => {
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                data: record.dataValue,
                nome: record.nome,
                ativo: record.ativoValue
            })
            this.setState({diaNaoUtilId: record.key})
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showDiasNaoUteisModal(true)
    }

    handleDeleteDiaNaoUtil = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteDiaNaoUtil?id='+id)
        .then(res => {
            if(res.data.success){
                this.requestGetDiasNaoUteis()
                this.showNotification(res.data.msg, res.data.success)
            }
            else{
                this.showNotification(res.data.msg, res.data.success)
            }
            
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.diaNaoUtilId ? this.state.diaNaoUtilId : null
                var data = moment(values.data, "DD/MM/YYYY").format("YYYY-MM-DD")
                var request = {
                    id: id,
                    nome: values.nome,
                    data: data,
                    ativo: values.ativo
                }
                this.requestCreateUpdateDiaNaoUtil(request)
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
            duration: 3
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

    componentWillMount(){
        this.requestGetDiasNaoUteis()
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Mês',
            dataIndex: 'nomeMes',
            sorter: (a, b) => this.compareByAlph(a.nomeMes, b.nomeMes)
        },
        {
            title: 'Data',
            dataIndex: 'dataDescription',
            sorter: (a, b) => this.compareByAlph(a.dataDescription, b.dataDescription)
        },
        {
            title: 'Descrição',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadDiasNaoUteisModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteDiaNaoUtil(record.key)}>
                            <a href="/admin/cadastros/dias-nao-uteis" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Dia não Útil" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadDiasNaoUteisModal()}><Icon type="plus" /> Novo Dia não Útil</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Dias não Úteis"
                    visible={this.state.showDiasNaoUteisModal}
                    onCancel={() => this.showDiasNaoUteisModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showDiasNaoUteisModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarDiaNaoUtil} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeDiasNaoUteis" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Dia não Útil"
                                >
                                    {getFieldDecorator('data', {
                                        rules: [{ required: true, message: 'Por favor informe o dia não útil' }]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione o dia não útil"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colCadastroDeDiasNaoUteis')}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do dia não útil',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Nome do dia não últil"
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
                                            getPopupContainer={() => document.getElementById('colCadastroDeDiasNaoUteis')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(DiasNaoUteis))