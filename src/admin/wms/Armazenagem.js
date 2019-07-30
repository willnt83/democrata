import React, { Component } from 'react'
import { Layout, Table, Icon, Button, Row, Col } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import ArmazenagemInsumos from './ArmazenagemInsumos'
import moment from 'moment'

const { Content } = Layout

class Armazenagem extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Armazenagem')
    }

    state = {
        tableData: [],
        tableLoading: false,
        showArmazenagemModal: false,
        idArmazenagem: null
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    requestGetArmazenagens = () => {
        axios
        .get(this.props.backEndPoint + '/getArmazenagens')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    tableData: res.data.payload.map(armazenagem => {
                        var dthrArmazenagem = moment(armazenagem.dthrArmazenagem).format('DD/MM/YYYY H:mm:ss')
                        return({
                            idArmazenagem: armazenagem.idArmazenagem,
                            usuario: {
                                id: armazenagem.usuario.id,
                                nome: armazenagem.usuario.nome
                            },
                            dthrArmazenagem: dthrArmazenagem
                        })
                    })
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    showArmazenagemModalF = (showArmazenagemModal, idArmazenagem = null) => {
        if(idArmazenagem != null)
            this.setState({idArmazenagem: idArmazenagem})
        // Se estiver fechando
        if(!showArmazenagemModal)
            this.setState({idArmazenagem: null})
        this.setState({showArmazenagemModal})
    }

    componentDidMount(){
        this.requestGetArmazenagens()
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'idArmazenagem',
            sorter: (a, b) => a.idArmazenagem - b.idArmazenagem,
        },
        {
            title: 'Data da Armazenagem',
            dataIndex: 'dthrArmazenagem',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dthrArmazenagem, b.dthrArmazenagem)
        },
        {
            title: 'Usuario',
            dataIndex: 'usuario.nome',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.usuario.nome, b.usuario.nome)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Editar armazenagem" onClick={() => this.showArmazenagemModalF(true, record.idArmazenagem)} />
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
                    rowKey='idArmazenagem'
                />
                <ArmazenagemInsumos
                    idArmazenagem={this.state.idArmazenagem}
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