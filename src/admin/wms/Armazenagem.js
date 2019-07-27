import React, { Component } from 'react'
import { Layout, Table, Icon, Button, Row, Col } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
//import axios from "axios"
import ArmazenagemInsumos from './ArmazenagemInsumos'

const { Content } = Layout

class Armazenagem extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Armazenagem')
    }

    state = {
        tableData: [],
        tableLoading: false,
        showArmazenagemModal: false
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    /*
    requestGetSetores = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getSetores?param1=09320')
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
    */
    showArmazenagemModalF = (showArmazenagemModal) => {
        // Se estiver fechando
        if(!showArmazenagemModal){
            //this.props.form.resetFields()
        }
        this.setState({showArmazenagemModal})
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.key,
        },
        {
            title: 'Data da Armazenagem',
            dataIndex: 'dthrArmazenagem',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.insumo.dataEntrada, b.insumo.dataEntrada)
        },
        {
            title: 'Operador',
            dataIndex: 'operador',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.operador, b.operador)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Armazenar" onClick={() => this.loadArmazenagemModal(record)} />
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
                        <Tooltip title="Efetuar uma nova armazenagem?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.showArmazenagemModalF(true)}><Icon type="plus" /> Nova Armazenagem</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <ArmazenagemInsumos
                    showArmazenagemModalF={this.showArmazenagemModalF}
                    showArmazenagemModal={this.state.showArmazenagemModal}
                />
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

export default connect(MapStateToProps, mapDispatchToProps)(Armazenagem)