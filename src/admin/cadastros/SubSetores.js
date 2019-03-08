import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { withStyles } from '@material-ui/core/styles'
import BackEndRequests from '../hocs/BackEndRequests'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

const styles = ({
    customFilterDropdown: {
        padding: 8,
        borderRadius: 6,
        background: '#fff',
        boxShadow: '0 1px 6px rgba(0, 0, 0, .2)'
    },
    customFilterDropdownInput: {
        width: 130,
        marginRight: 8
    },
    customFilterDropdownButton: {
        marginRight: 8
    },
    highlight: {
        color: '#f50'
    }
})

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}

]

class Subsetores extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Subsetores')
    }

    state = {
        subsetorId: null,
        tableData: [],
        showSubsetoresModal: false,
        tableLoading: false,
        buttonSalvarSubsetor: false,
        setoresOptions: []
    }

    requestGetSetores = () => {
        axios
        .get('http://localhost/getSetores')
        .then(res => {
            if(res.data){
                var setoresOptions = res.data.payload.map(setor => {
                    return{
                        value: setor.id,
                        description: setor.nome
                    }
                })
                this.setState({setoresOptions})
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetSubsetores = () => {
        this.setState({tableLoading: true})
        axios
        .get('http://localhost/getSubsetores')
        .then(res => {
            if(res.data){
                var tableData = res.data.payload.map(subsetor => {
                    var ativo = subsetor.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: subsetor.id,
                        nome: subsetor.nome,
                        ativo: ativo,
                        ativoValue: subsetor.ativo,
                        setor: {
                            id: subsetor.setor.id,
                            nome: subsetor.setor.nome
                        }
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

    requestCreateUpdateSubsetor = (request) => {
        this.setState({buttonSalvarSubsetor: true})
        axios.post('http://localhost/createUpdateSubsetor', request)
        .then(res => {
            this.showSubsetoresModal(false)
            this.requestGetSubsetores()
            this.setState({buttonSalvarSubsetor: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarSubsetor: false})
        })
    }

    showSubsetoresModal = (showSubsetoresModal) => {
        // Se estiver fechando
        if(!showSubsetoresModal){
            this.props.form.resetFields()
            this.setState({subsetorId: null})
        }
        this.setState({showSubsetoresModal})
    }

    loadSubsetoresModal = (record) => {
        this.requestGetSetores()
        if(typeof(record) !== "undefined") {
            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue,
                setor: record.setor.id
            })
            this.setState({subsetorId: record.key})
        }
        this.showSubsetoresModal(true)
    }

    handleDeleteSubsetor = (id) => {
        this.setState({tableLoading: true})
        axios
        .get('http://localhost/deleteSubsetor?id='+id)
        .then(res => {
            this.requestGetSubsetores()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.subsetorId ? this.state.subsetorId : null
                var setor = {
                    id: values.setor
                }

                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo,
                    setor: setor
                }

                this.requestCreateUpdateSubsetor(request)
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
        this.requestGetSubsetores()
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
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        },
        {
            title: 'Setor',
            dataIndex: 'setor.nome',
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadSubsetoresModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteSubsetor(record.key)}>
                            <a href="/admin/cadastros/sub-setores" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar um novo Subsetor?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadSubsetoresModal()}><Icon type="plus" /> Novo Subsetor</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Subsetores"
                    visible={this.state.showSubsetoresModal}
                    onCancel={() => this.showSubsetoresModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showSubsetoresModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarSubsetor} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item
                            label="Nome"
                        >
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome do subsetor',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome do subsetor"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="Setor">
                            {getFieldDecorator('setor')(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Selecione"
                                >
                                    {
                                        this.state.setoresOptions.map((option) => {
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
	}
}
const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(BackEndRequests(withStyles(styles)(Form.create()(Subsetores))))